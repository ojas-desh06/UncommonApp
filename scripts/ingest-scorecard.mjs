import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const INPUT = "data/scorecard.json";
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

  const schools = JSON.parse(await readFile(INPUT, "utf8"));
  console.log(`Ingesting ${schools.length} schools...`);

  const now = new Date().toISOString();
  const rows = schools.map((s) => ({
    id: s.id,
    ipeds_id: s.ipeds_id,
    name: s.name,
    state: s.state,
    city: s.city,
    lat: s.lat,
    lon: s.lon,
    type: s.type,
    size: s.size,
    admission_rate: s.admission_rate,
    sat_25: s.sat_25,
    sat_75: s.sat_75,
    tuition: s.tuition,
    top_majors: s.top_majors || [],
    scorecard_last_synced: now,
  }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("colleges")
      .upsert(batch, { onConflict: "id" });
    if (error) {
      throw new Error(`Batch starting at ${i} failed: ${error.message}`);
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
