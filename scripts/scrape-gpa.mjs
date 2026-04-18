import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const INPUT = "data/scorecard.json";
const OUTPUT = "data/gpa-scraped.json";
const UA =
  "UncommonApp-scraper/0.1 (https://github.com/ojas-desh06/UncommonApp; student project)";
const BASE = "https://www.prepscholar.com/sat/s/colleges/";
const DELAY_MS = 800;
const SAVE_EVERY = 25;
const MAX_RETRIES = 2;

const PRIMARY = /average\s+GPA\s+at\s+[^.]{1,120}?\s+is\s+(\d\.\d{1,2})/i;
const FALLBACK = /\bGPA\s+of\s+(\d\.\d{2})\b/i;
const ESTIMATED_MARKER = /did not officially report/i;

function slugCandidates(name) {
  const candidates = [];
  const push = (s) => {
    const clean = s
      .trim()
      .replace(/&/g, "and")
      .replace(/[^A-Za-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (clean && !candidates.includes(clean)) candidates.push(clean);
  };

  // Primary: full name as-is
  push(name);

  // Strip leading "The "
  if (/^The\s+/i.test(name)) push(name.replace(/^The\s+/i, ""));

  // Strip trailing campus modifiers after a hyphen: "University of X-Main Campus", "X-Ann Arbor"
  // Only strip if what's before the last hyphen is multi-word (avoid killing "Rose-Hulman")
  const lastDash = name.lastIndexOf("-");
  if (lastDash > 0) {
    const before = name.slice(0, lastDash);
    if (/\s/.test(before)) push(before);
  }

  // UC abbreviation: "University of California-Berkeley" → "UC-Berkeley"
  const ucMatch = name.match(/^University of California[-\s]+(.+)$/i);
  if (ucMatch) push(`UC ${ucMatch[1]}`);

  // "State University of New York at X" → "SUNY X"
  const sunyMatch = name.match(/^State University of New York (?:at\s+)?(.+)$/i);
  if (sunyMatch) push(`SUNY ${sunyMatch[1]}`);

  return candidates;
}

function extractGPA(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

  const estimated = ESTIMATED_MARKER.test(text);
  let m = text.match(PRIMARY);
  let pattern = "primary";
  if (!m) {
    m = text.match(FALLBACK);
    pattern = "fallback";
  }
  if (!m) return null;

  const gpa = parseFloat(m[1]);
  if (!Number.isFinite(gpa) || gpa < 2.0 || gpa > 5.0) return null;

  return {
    gpa: Math.round(gpa * 100) / 100,
    pattern,
    estimated,
    snippet: m[0].slice(0, 200).replace(/\s+/g, " ").trim(),
  };
}

async function fetchOnce(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return { ok: res.ok, status: res.status, html: res.ok ? await res.text() : null };
}

async function fetchWithRetry(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const r = await fetchOnce(url);
    if (r.ok) return r.html;
    if (r.status === 404) return null; // don't retry 404s
    if (r.status === 429 || r.status >= 500) {
      await new Promise((res) => setTimeout(res, 2000 * (attempt + 1)));
      continue;
    }
    return null;
  }
  return null;
}

async function scrapeSchool(school) {
  const candidates = slugCandidates(school.name);
  for (const slug of candidates) {
    const url = `${BASE}${slug}-admission-requirements`;
    const html = await fetchWithRetry(url);
    if (!html) continue;
    const extracted = extractGPA(html);
    if (extracted) return { ...extracted, source: url, slug_used: slug };
  }
  return null;
}

async function save(results) {
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(results, null, 2) + "\n");
}

async function main() {
  const schools = JSON.parse(await readFile(INPUT, "utf8"));
  const existing = await readFile(OUTPUT, "utf8")
    .then((x) => JSON.parse(x))
    .catch(() => ({}));

  console.log(
    `Scraping GPA for ${schools.length} schools (${Object.keys(existing).length} already cached)...`,
  );

  let hits = 0;
  let misses = 0;
  let reported = 0;
  const results = { ...existing };
  const startTime = Date.now();

  for (let i = 0; i < schools.length; i++) {
    const s = schools[i];
    // Skip if already have a real hit (not a null) cached
    if (results[s.id]?.gpa != null) {
      hits++;
      if (!results[s.id].estimated) reported++;
      continue;
    }

    const label = `[${i + 1}/${schools.length}] ${s.id.slice(0, 40).padEnd(40)}`;
    try {
      const extracted = await scrapeSchool(s);
      const ts = new Date().toISOString();
      if (extracted) {
        results[s.id] = {
          gpa: extracted.gpa,
          source: extracted.source,
          slug_used: extracted.slug_used,
          pattern: extracted.pattern,
          estimated: extracted.estimated,
          snippet: extracted.snippet,
          scraped_at: ts,
        };
        hits++;
        if (!extracted.estimated) reported++;
        console.log(
          `${label} ${extracted.gpa}${extracted.estimated ? "*" : " "} (${extracted.slug_used})`,
        );
      } else {
        results[s.id] = {
          gpa: null,
          slug_candidates: slugCandidates(s.name),
          scraped_at: ts,
        };
        misses++;
        console.log(`${label} MISS`);
      }
    } catch (e) {
      results[s.id] = { gpa: null, error: e.message, scraped_at: new Date().toISOString() };
      misses++;
      console.log(`${label} ERROR: ${e.message}`);
    }

    if ((i + 1) % SAVE_EVERY === 0) await save(results);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  await save(results);
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `\n${hits} hits (${reported} school-reported, ${hits - reported} PrepScholar-estimated), ${misses} misses, ${elapsed}s elapsed → ${OUTPUT}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
