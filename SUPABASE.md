# Supabase setup

## One-time (per contributor)

1. Ask a project owner to invite you to the Supabase project (Dashboard → Project Settings → Team).
2. `cp .env.example .env.local` and paste values from Dashboard → Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Publishable key (the new name for the anon key). Safe to expose in the browser.
3. Never commit `.env.local`. Never put the **secret** (service role) key in any `NEXT_PUBLIC_*` var.

## Using Supabase in code

- **Client components:** `import { createClient } from "@/lib/supabase/client"`
- **Server components / Route Handlers / Server Actions:** `import { createClient } from "@/lib/supabase/server"` (it's async — `const supabase = await createClient()`)
- Session cookies are refreshed automatically by `middleware.ts`.

## Schema changes

- Do **not** change schema from the dashboard without capturing it as a migration.
- Use the Supabase CLI or the MCP `apply_migration` tool — both produce a file in `supabase/migrations/` that must be committed.
- Prefer a Supabase branch per feature (Dashboard → Branches) so nobody corrupts shared dev data.

## MCP (agent access)

- `.mcp.json` is committed with the shared project ref.
- Each contributor runs their own OAuth flow the first time their agent calls a Supabase tool — tokens are per-user and not shared.
