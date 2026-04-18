import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const INPUT = "data/schools-to-scrape.json";
const OUTPUT = "data/gpa-scraped.json";
const UA =
  "UncommonApp-scraper/0.1 (https://github.com/ojas-desh06/UncommonApp; student project)";
const DELAY_MS = 600;

// PrepScholar pages have consistent copy: "The average GPA at X is N.NN."
const PRIMARY = /average\s+GPA\s+at\s+[^.]{1,80}?\s+is\s+(\d\.\d{1,2})/i;
// Fallback: "a GPA of N.NN"
const FALLBACK = /\bGPA\s+of\s+(\d\.\d{2})\b/i;
// Heuristic flag: PrepScholar says "did not officially report" when GPA is estimated.
const ESTIMATED_MARKER = /did not officially report/i;

async function fetchPage(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function extractGPA(html) {
  const text = stripHtml(html);
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
    snippet: m[0].slice(0, 240).replace(/\s+/g, " ").trim(),
  };
}

async function main() {
  const schools = JSON.parse(await readFile(INPUT, "utf8"));
  const results = {};
  let hits = 0;
  let reported = 0;

  for (const s of schools) {
    process.stdout.write(`${s.slug.padEnd(14)} `);
    const url = s.prepscholar_url;
    try {
      const html = await fetchPage(url);
      const extracted = extractGPA(html);
      const ts = new Date().toISOString();
      if (extracted) {
        results[s.slug] = {
          gpa: extracted.gpa,
          source: url,
          pattern: extracted.pattern,
          estimated: extracted.estimated,
          snippet: extracted.snippet,
          scraped_at: ts,
        };
        hits++;
        if (!extracted.estimated) reported++;
        console.log(
          `${extracted.gpa}  [${extracted.pattern}${extracted.estimated ? ", estimated" : ""}]`,
        );
      } else {
        results[s.slug] = {
          gpa: null,
          source: url,
          pattern: null,
          estimated: null,
          snippet: null,
          scraped_at: ts,
        };
        console.log("no match");
      }
    } catch (e) {
      results[s.slug] = {
        gpa: null,
        source: url,
        error: e.message,
        scraped_at: new Date().toISOString(),
      };
      console.log(`error: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(results, null, 2) + "\n");
  console.log(
    `\n${hits}/${schools.length} hits (${reported} school-reported, ${hits - reported} PrepScholar-estimated) → ${OUTPUT}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
