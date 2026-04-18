import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const OUTPUT = "data/scorecard.json";
const BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";
const PER_PAGE = 100;
const DELAY_MS = 200;
const MAX_PAGES = Number(process.env.MAX_PAGES) || Infinity;

async function loadEnv() {
  const raw = await readFile(".env.local", "utf8").catch(() => "");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.ownership",
  "school.school_url",
  "location.lat",
  "location.lon",
  "latest.student.size",
  "latest.admissions.admission_rate.overall",
  "latest.admissions.sat_scores.25th_percentile.critical_reading",
  "latest.admissions.sat_scores.25th_percentile.math",
  "latest.admissions.sat_scores.75th_percentile.critical_reading",
  "latest.admissions.sat_scores.75th_percentile.math",
  "latest.cost.tuition.in_state",
  "latest.cost.tuition.out_of_state",
  "latest.academics.program_percentage",
].join(",");

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mapOwnership(code) {
  // 1 = public, 2 = private non-profit, 3 = private for-profit
  if (code === 1) return "public";
  if (code === 2) return "private";
  return null;
}

function sumSat(row, percentile) {
  const reading =
    row[`latest.admissions.sat_scores.${percentile}.critical_reading`];
  const math = row[`latest.admissions.sat_scores.${percentile}.math`];
  if (reading == null || math == null) return null;
  return Math.round(reading + math);
}

function topMajors(programPercentage, n = 4) {
  if (!programPercentage || typeof programPercentage !== "object") return [];
  return Object.entries(programPercentage)
    .filter(([, pct]) => typeof pct === "number" && pct > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) =>
      key
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    );
}

function normalize(row) {
  const name = row["school.name"];
  if (!name) return null;

  const ownership = mapOwnership(row["school.ownership"]);
  if (!ownership) return null; // drop for-profit

  const admissionRate = row["latest.admissions.admission_rate.overall"];
  if (admissionRate == null) return null; // drop schools without admission data

  return {
    id: slugify(name),
    ipeds_id: Number(row.id),
    name,
    city: row["school.city"],
    state: row["school.state"],
    lat: row["location.lat"],
    lon: row["location.lon"],
    type: ownership,
    size: row["latest.student.size"],
    admission_rate: admissionRate,
    sat_25: sumSat(row, "25th_percentile"),
    sat_75: sumSat(row, "75th_percentile"),
    tuition:
      ownership === "public"
        ? (row["latest.cost.tuition.in_state"] ?? null)
        : (row["latest.cost.tuition.out_of_state"] ??
          row["latest.cost.tuition.in_state"] ??
          null),
    top_majors: topMajors(row["latest.academics.program_percentage"]),
    school_url: row["school.school_url"] || null,
  };
}

async function fetchPage(page) {
  const params = new URLSearchParams({
    "school.operating": "1",
    "school.degrees_awarded.predominant": "3",
    "school.ownership": "1,2",
    "latest.student.size__range": "1000..",
    "latest.admissions.admission_rate.overall__range": "0.001..0.80",
    fields: FIELDS,
    per_page: String(PER_PAGE),
    page: String(page),
    api_key: process.env.COLLEGE_SCORECARD_API_KEY,
  });
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function main() {
  await loadEnv();
  if (!process.env.COLLEGE_SCORECARD_API_KEY) {
    throw new Error("COLLEGE_SCORECARD_API_KEY missing from .env.local");
  }

  const schools = [];
  const slugCounts = new Map();

  const first = await fetchPage(0);
  const total = first.metadata?.total ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);
  console.log(`Scorecard: ${total} schools matched filter → ${totalPages} pages`);

  const pagesToFetch = Math.min(totalPages, MAX_PAGES);

  for (let page = 0; page < pagesToFetch; page++) {
    const data = page === 0 ? first : await fetchPage(page);
    for (const row of data.results) {
      const normalized = normalize(row);
      if (!normalized) continue;
      const count = (slugCounts.get(normalized.id) || 0) + 1;
      slugCounts.set(normalized.id, count);
      if (count > 1) normalized.id = `${normalized.id}-${normalized.ipeds_id}`;
      schools.push(normalized);
    }
    console.log(
      `  page ${page + 1}/${pagesToFetch}: +${data.results.length} raw, running total ${schools.length} kept`,
    );
    if (page < pagesToFetch - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(schools, null, 2) + "\n");
  console.log(`\n${schools.length} schools written to ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
