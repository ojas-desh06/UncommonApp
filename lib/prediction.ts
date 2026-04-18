import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type {
  Classification,
  CdsFactors,
  College,
  Prediction,
  SchoolPrediction,
  StudentProfile,
} from "./types";
import type { EssayScores } from "./essay-analysis";

const REGION_STATES: Record<string, string[]> = {
  Northeast: ["CT", "ME", "MA", "NH", "NJ", "NY", "PA", "RI", "VT"],
  Midwest: ["IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"],
  South: ["AL", "AR", "DE", "FL", "GA", "KY", "LA", "MD", "MS", "NC", "OK", "SC", "TN", "TX", "VA", "WV", "DC"],
  West: ["AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
};

const SIZE_RANGES: Record<string, [number, number]> = {
  small: [0, 5000],
  medium: [5000, 15000],
  large: [15000, 999999],
  any: [0, 999999],
};

const DEFAULT_CDS: CdsFactors = {
  rigor: "considered",
  gpa: "important",
  test_scores: "considered",
  essays: "considered",
  recommendations: "considered",
  ecs: "considered",
  demonstrated_interest: "not_considered",
  first_gen: "considered",
  legacy: "considered",
};

// ── Part A: rule-based scoring ────────────────────────────────────────────────

function clamp(x: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, x));
}

function toSat(student: StudentProfile): number | null {
  if (student.test_type === "test_optional" || student.test_score == null) return null;
  if (student.test_type === "SAT") return student.test_score;
  const map: Record<number, number> = {
    36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400,
    30: 1370, 29: 1340, 28: 1310, 27: 1280, 26: 1240, 25: 1210,
    24: 1180, 23: 1140, 22: 1110, 21: 1080, 20: 1040, 19: 1010,
    18: 970, 17: 930, 16: 890, 15: 850, 14: 800, 13: 760, 12: 710,
  };
  return map[Math.round(student.test_score)] ?? 1000;
}

function classify(chance: number): Classification {
  if (chance >= 0.6) return "safety";
  if (chance >= 0.3) return "target";
  if (chance >= 0.1) return "reach";
  return "hard_reach";
}

function scoreChance(student: StudentProfile, college: College, essay: EssayScores | null): number {
  let chance = Number(college.admission_rate);
  const gpa = Math.max(student.gpa_unweighted, student.gpa_weighted - 0.5);

  if (college.gpa_50 != null) {
    chance *= Math.pow(1.8, (gpa - Number(college.gpa_50)) * 4);
  }

  const sat = toSat(student);
  if (sat != null && college.sat_25 != null && college.sat_75 != null) {
    const mid = (college.sat_25 + college.sat_75) / 2;
    chance *= Math.pow(1.4, (sat - mid) / 100);
  } else if (sat == null && college.sat_25 != null) {
    chance *= 0.85;
  }

  if (student.rigor_count >= 8) chance *= 1.15;
  else if (student.rigor_count <= 2) chance *= 0.75;

  if (student.first_gen) chance *= 1.1;
  if (student.legacy && student.legacy_schools.some(s => s.toLowerCase().includes(college.name.toLowerCase()))) chance *= 1.6;
  if (student.recruited_athlete) chance *= 2.0;

  if (essay != null) {
    if (essay.overall >= 8) chance *= 1.12;
    else if (essay.overall <= 4) chance *= 0.88;
  }

  return clamp(chance, 0.01, 0.95);
}

async function fetchColleges(student: StudentProfile): Promise<College[]> {
  const supabase = await createClient();

  let states: string[] = [];
  if (!student.region_preference.includes("Any")) {
    for (const r of student.region_preference) {
      states.push(...(REGION_STATES[r] ?? []));
    }
    if (!states.includes(student.state)) states.push(student.state);
  }

  const [minSize, maxSize] = SIZE_RANGES[student.size_preference];

  let query = supabase
    .from("colleges")
    .select("*")
    .not("admission_rate", "is", null)
    .lte("tuition", student.max_budget * 1.4);

  if (states.length > 0) query = query.in("state", states);
  if (student.size_preference !== "any") {
    query = query.gte("size", minSize).lte("size", maxSize);
  }

  const { data } = await query.limit(300);

  // If too few results, fall back without size/budget filter
  if (!data || data.length < 10) {
    const { data: fallback } = await supabase
      .from("colleges")
      .select("*")
      .not("admission_rate", "is", null)
      .limit(300);
    return mapRows(fallback ?? []);
  }

  return mapRows(data);
}

function mapRows(rows: Record<string, unknown>[]): College[] {
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    location: {
      state: String(row.state),
      city: String(row.city ?? ""),
      lat: Number(row.lat ?? 0),
      lon: Number(row.lon ?? 0),
    },
    type: (row.type as "public" | "private") ?? "public",
    size: Number(row.size ?? 0),
    admission_rate: Number(row.admission_rate),
    sat_25: row.sat_25 != null ? Number(row.sat_25) : null,
    sat_75: row.sat_75 != null ? Number(row.sat_75) : null,
    gpa_50: row.gpa_50 != null ? Number(row.gpa_50) : null,
    tuition: Number(row.tuition ?? 0),
    has_merit_aid: Boolean(row.has_merit_aid ?? false),
    top_majors: (row.top_majors as string[]) ?? [],
    cds_factors: (row.cds_factors as CdsFactors) ?? DEFAULT_CDS,
  }));
}

function pickSpread(scored: { college: College; chance: number }[]) {
  const by = (cls: Classification) => scored.filter(s => classify(s.chance) === cls);
  return [
    ...by("safety").slice(0, 2),
    ...by("target").slice(0, 4),
    ...by("reach").slice(0, 3),
    ...by("hard_reach").slice(0, 1),
  ];
}

// ── Part B: Claude narrative generation ───────────────────────────────────────

type Narrative = {
  college_id: string;
  working_for: [string, string, string];
  working_against: [string, string, string];
  what_would_help: string[];
};

type NarrativeResult = { headline: string; schools: Narrative[] };

async function generateNarratives(
  student: StudentProfile,
  selected: { college: College; chance: number; classification: Classification }[],
  essay: EssayScores | null,
): Promise<NarrativeResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[prediction] ANTHROPIC_API_KEY is not set, using fallback narratives");
    return fallbackNarratives(student, selected);
  }

  const sat = toSat(student);
  const gpa = Math.max(student.gpa_unweighted, student.gpa_weighted - 0.5).toFixed(2);

  const profile = [
    `GPA: ${gpa} UW / ${student.gpa_weighted.toFixed(2)} W`,
    student.test_type === "test_optional"
      ? "Test optional"
      : `${student.test_type} ${student.test_score}${sat && student.test_type === "ACT" ? ` (~SAT ${sat})` : ""}`,
    `Rigor: ${student.rigor_count} advanced courses`,
    `Activities: ${student.activities.filter(Boolean).join("; ") || "none"}`,
    `Awards: ${student.awards.filter(Boolean).join("; ") || "none"}`,
    `Major: ${student.intended_major}`,
    `First-gen: ${student.first_gen} | Legacy: ${student.legacy} | Athlete: ${student.recruited_athlete}`,
    essay ? `Essay: ${essay.overall}/10 — ${essay.summary}` : "No essay analyzed",
  ].join("\n");

  const schools = selected.map(s => ({
    id: s.college.id,
    name: s.college.name,
    state: s.college.location.state,
    admission_rate: `${(s.college.admission_rate * 100).toFixed(0)}%`,
    gpa_50: s.college.gpa_50 ?? "not reported",
    sat_range: s.college.sat_25 && s.college.sat_75
      ? `${s.college.sat_25}–${s.college.sat_75}`
      : "not reported",
    classification: s.classification,
    modeled_chance: `${(s.chance * 100).toFixed(0)}%`,
  }));

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 6000,
    system: [
      {
        type: "text",
        text: "You are a college admissions counselor. Write honest, specific, data-grounded analysis. Avoid generic filler. Reference actual numbers from the student's profile and the school's stats.",
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        name: "submit_narratives",
        description: "Submit personalized admissions narratives for each school",
        input_schema: {
          type: "object" as const,
          properties: {
            headline: {
              type: "string",
              description: "1-2 sentence honest overall assessment of this student's list",
            },
            schools: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  college_id: { type: "string" },
                  working_for: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                    description: "Exactly 3 specific factors in the student's favor at this school",
                  },
                  working_against: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                    description: "Exactly 3 specific factors working against the student at this school",
                  },
                  what_would_help: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 2,
                    description: "1-2 concrete, actionable things that would improve this student's chances",
                  },
                },
                required: ["college_id", "working_for", "working_against", "what_would_help"],
              },
            },
          },
          required: ["headline", "schools"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_narratives" },
    messages: [
      {
        role: "user",
        content: `Student profile:\n${profile}\n\nSchools to analyze:\n${JSON.stringify(schools, null, 2)}\n\nFor each school, generate honest narratives based on how this student's numbers compare to that school's admitted student profile.`,
      },
    ],
  });

    const tool = response.content.find(b => b.type === "tool_use");
    if (!tool || tool.type !== "tool_use") {
      console.error("[prediction] Claude did not return tool_use:", JSON.stringify(response.content));
      return fallbackNarratives(student, selected);
    }

    const result = tool.input as NarrativeResult;
    if (!result.schools || !Array.isArray(result.schools)) {
      console.error("[prediction] Unexpected Claude output shape:", JSON.stringify(result));
      return fallbackNarratives(student, selected);
    }
    return result;
  } catch (err) {
    console.error("[prediction] Claude call failed:", err);
    return fallbackNarratives(student, selected);
  }
}

function fallbackNarratives(
  student: StudentProfile,
  selected: { college: College; chance: number; classification: Classification }[],
): NarrativeResult {
  const safeties = selected.filter(s => s.classification === "safety").length;
  const targets = selected.filter(s => s.classification === "target").length;
  const reaches = selected.filter(s => ["reach", "hard_reach"].includes(s.classification)).length;
  return {
    headline: `${safeties} safeties, ${targets} targets, ${reaches} reaches across your list.`,
    schools: selected.map(s => ({
      college_id: s.college.id,
      working_for: [
        `Admission rate of ${(s.college.admission_rate * 100).toFixed(0)}% places this school as a ${s.classification}.`,
        `Your GPA of ${Math.max(student.gpa_unweighted, student.gpa_weighted - 0.5).toFixed(2)} is competitive here.`,
        `Interest in ${student.intended_major} aligns with programs offered.`,
      ],
      working_against: [
        `${(s.college.admission_rate * 100).toFixed(0)}% admission rate means committee decisions are highly contextual.`,
        `Strong competition from applicants with similar academic profiles.`,
        `Demonstrated interest and fit narrative will be critical differentiators.`,
      ],
      what_would_help: ["Craft a specific 'why this school' essay referencing programs and faculty."],
    })),
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generatePrediction(
  id: string,
  student: StudentProfile,
  essay: EssayScores | null = null,
): Promise<Prediction> {
  const colleges = await fetchColleges(student);

  if (colleges.length === 0) {
    return {
      id,
      student,
      generated_at: new Date().toISOString(),
      headline: "No colleges found matching your preferences — try expanding your region or budget.",
      schools: [],
    };
  }

  const scored = colleges
    .map(c => ({ college: c, chance: scoreChance(student, c, essay) }))
    .sort((a, b) => b.chance - a.chance);

  const selected = pickSpread(scored).map(s => ({ ...s, classification: classify(s.chance) }));

  const narratives = await generateNarratives(student, selected, essay);
  const byId = new Map(narratives.schools.map(n => [n.college_id, n]));

  const schools: SchoolPrediction[] = selected.map(s => {
    const n = byId.get(s.college.id);
    return {
      college: s.college,
      classification: s.classification,
      chance_low: clamp(s.chance - 0.08, 0.01, 0.93),
      chance_high: clamp(s.chance + 0.08, 0.02, 0.95),
      working_for: (n?.working_for ?? [
        `Admission rate: ${(s.college.admission_rate * 100).toFixed(0)}%.`,
        `Your GPA is competitive for this school.`,
        `Major interest aligns with programs offered.`,
      ]) as [string, string, string],
      working_against: (n?.working_against ?? [
        "High competition from strong applicant pool.",
        "Committee decisions are highly contextual.",
        "Limited information about your extracurricular depth.",
      ]) as [string, string, string],
      what_would_help: n?.what_would_help ?? ["Craft a compelling why this school essay."],
    };
  });

  return {
    id,
    student,
    generated_at: new Date().toISOString(),
    headline: narratives.headline,
    schools,
  };
}
