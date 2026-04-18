import type {
  Classification,
  College,
  Prediction,
  SchoolPrediction,
  StudentProfile,
} from "./types";
import { MOCK_COLLEGES } from "./mock-colleges";

function clamp(x: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, x));
}

function studentSatNormalized(student: StudentProfile): number | null {
  if (student.test_type === "test_optional" || student.test_score == null) return null;
  if (student.test_type === "SAT") return student.test_score;
  const actToSat: Record<number, number> = {
    36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400,
    30: 1370, 29: 1340, 28: 1310, 27: 1280, 26: 1240, 25: 1210,
    24: 1180, 23: 1140, 22: 1110, 21: 1080, 20: 1040, 19: 1010,
    18: 970, 17: 930, 16: 890, 15: 850, 14: 800, 13: 760, 12: 710,
  };
  return actToSat[Math.round(student.test_score)] ?? 1000;
}

function classify(chance: number): Classification {
  if (chance >= 0.6) return "safety";
  if (chance >= 0.3) return "target";
  if (chance >= 0.1) return "reach";
  return "hard_reach";
}

function predictOne(student: StudentProfile, college: College): SchoolPrediction {
  let chance = college.admission_rate;

  const studentGpa = Math.max(student.gpa_unweighted, student.gpa_weighted - 0.5);
  if (college.gpa_50 != null) {
    const gpaDelta = studentGpa - college.gpa_50;
    chance *= Math.pow(1.8, gpaDelta * 4);
  }

  const studentSat = studentSatNormalized(student);
  if (studentSat != null && college.sat_75 != null && college.sat_25 != null) {
    const satMid = (college.sat_25 + college.sat_75) / 2;
    const satDelta = (studentSat - satMid) / 100;
    chance *= Math.pow(1.4, satDelta);
  } else if (studentSat == null && college.cds_factors.test_scores === "very_important") {
    chance *= 0.75;
  }

  if (student.rigor_count >= 8) chance *= 1.15;
  else if (student.rigor_count <= 2) chance *= 0.7;

  if (student.first_gen && college.cds_factors.first_gen !== "not_considered") {
    chance *= 1.15;
  }
  if (student.legacy && college.cds_factors.legacy !== "not_considered") {
    chance *= 1.6;
  }
  if (student.recruited_athlete) {
    chance *= 2.2;
  }

  chance = clamp(chance, 0.01, 0.95);
  const classification = classify(chance);
  const chance_low = clamp(chance - 0.08, 0.01, 0.95);
  const chance_high = clamp(chance + 0.08, 0.02, 0.95);

  const working_for: string[] = [];
  const working_against: string[] = [];
  const what_would_help: string[] = [];

  if (college.gpa_50 != null && studentGpa >= college.gpa_50) {
    working_for.push(
      `Your GPA of ${studentGpa.toFixed(2)} matches or exceeds the typical admitted student (median ${college.gpa_50.toFixed(2)}).`,
    );
  } else if (college.gpa_50 != null) {
    working_against.push(
      `Your GPA of ${studentGpa.toFixed(2)} is below the admitted median of ${college.gpa_50.toFixed(2)}.`,
    );
  }

  if (studentSat != null && college.sat_75 != null && studentSat >= college.sat_75) {
    working_for.push(
      `A ${studentSat} testing profile lands above the 75th percentile (${college.sat_75}).`,
    );
  } else if (studentSat != null && college.sat_25 != null && studentSat < college.sat_25) {
    working_against.push(
      `Your test score of ${studentSat} falls below the 25th-percentile mark of ${college.sat_25}.`,
    );
  }

  if (student.rigor_count >= 8) {
    working_for.push(`Your course rigor (${student.rigor_count} advanced courses) signals readiness for this school's workload.`);
  } else if (student.rigor_count <= 3) {
    working_against.push(`Limited advanced coursework (${student.rigor_count}) will stand out against the typical admit.`);
  }

  if (student.first_gen && college.cds_factors.first_gen !== "not_considered") {
    working_for.push(`First-generation status is treated as a positive factor in this committee.`);
  }
  if (student.legacy && college.cds_factors.legacy !== "not_considered") {
    working_for.push(`Legacy status is considered here and moves the needle at the margin.`);
  }

  if (college.cds_factors.essays === "very_important") {
    working_against.push(`Essays are rated "very important" — a weak personal statement would be costly.`);
    what_would_help.push(`Invest deeply in a distinctive personal essay — this school reads them closely.`);
  }
  if (college.cds_factors.ecs === "very_important" && student.activities.filter((a) => a.trim()).length < 4) {
    working_against.push(`Extracurricular depth is rated "very important" and your profile has thin activities coverage.`);
    what_would_help.push(`Add one sustained, outcome-bearing commitment to your activities list.`);
  }

  if (studentSat != null && college.sat_25 != null && studentSat < college.sat_25) {
    what_would_help.push(`A retest adding ~${college.sat_25 - studentSat} points would move you into the middle 50%.`);
  }

  while (working_for.length < 3) {
    working_for.push(`Your stated interest in ${student.intended_major} aligns with programs this school is known for.`);
  }
  while (working_against.length < 3) {
    working_against.push(`${(college.admission_rate * 100).toFixed(0)}% admission rate means committee decisions are highly contextual.`);
  }
  if (what_would_help.length === 0) {
    what_would_help.push(`Sharpen the "why this school" narrative — specificity about programs and people will differentiate you.`);
  }

  return {
    college,
    classification,
    chance_low,
    chance_high,
    working_for: working_for.slice(0, 3),
    working_against: working_against.slice(0, 3),
    what_would_help: what_would_help.slice(0, 2),
  };
}

function buildHeadline(student: StudentProfile, schools: SchoolPrediction[]): string {
  const safeties = schools.filter((s) => s.classification === "safety").length;
  const targets = schools.filter((s) => s.classification === "target").length;
  const reaches = schools.filter((s) => s.classification === "reach" || s.classification === "hard_reach").length;
  if (targets + safeties >= 5) {
    return `Your profile is stronger than you think — ${targets + safeties} of these ${schools.length} schools are realistic fits, not reaches.`;
  }
  if (reaches > schools.length / 2) {
    return `You're aiming high: ${reaches} of ${schools.length} schools here are reaches. Balance the list before you apply.`;
  }
  return `A balanced list: ${safeties} safeties, ${targets} targets, ${reaches} reaches. Here's where each one stands.`;
}

export function generateMockPrediction(
  id: string,
  student: StudentProfile,
): Prediction {
  const schools = MOCK_COLLEGES.map((c) => predictOne(student, c)).sort(
    (a, b) => b.chance_high - a.chance_high,
  );
  return {
    id,
    student,
    generated_at: new Date().toISOString(),
    headline: buildHeadline(student, schools),
    schools,
  };
}
