import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const INPUT = "data/gpa-scraped.json";
const BATCH_SIZE = 100;

async function loadEnv() {
  const raw = await readFile(".env.local", "utf8").catch(() => "");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function main() {
  await loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const scraped = JSON.parse(await readFile(INPUT, "utf8"));
  const entries = Object.entries(scraped).filter(
    ([, v]) => typeof v?.gpa === "number",
  );
  console.log(
    `Ingesting ${entries.length} GPA values (skipped ${Object.keys(scraped).length - entries.length} misses)...`,
  );

  const now = new Date().toISOString();
  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    for (const [id, v] of batch) {
      const { error, data } = await supabase
        .from("colleges")
        .update({ gpa_50: v.gpa, gpa_last_synced: now })
        .eq("id", id)
        .select("id");
      if (error) {
        console.error(`  ${id}: ${error.message}`);
        continue;
      }
      if (!data || data.length === 0) {
        notFound++;
      } else {
        updated++;
      }
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length}`);
  }

  console.log(`\nDone. ${updated} rows updated, ${notFound} scraped IDs had no matching row in colleges.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
