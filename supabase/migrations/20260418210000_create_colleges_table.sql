create table public.colleges (
  id text primary key,
  ipeds_id integer unique not null,
  name text not null,
  state text not null,
  city text not null,
  lat double precision,
  lon double precision,
  type text not null check (type in ('public', 'private')),
  size integer,
  admission_rate numeric check (admission_rate between 0 and 1),
  sat_25 integer,
  sat_75 integer,
  gpa_50 numeric,
  tuition integer,
  has_merit_aid boolean default false,
  top_majors text[] default '{}'::text[],
  cds_factors jsonb,
  scorecard_last_synced timestamptz,
  gpa_last_synced timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_colleges_state on public.colleges (state);
create index idx_colleges_admission_rate on public.colleges (admission_rate);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_on_colleges
before update on public.colleges
for each row execute function public.set_updated_at();

alter table public.colleges enable row level security;

create policy "colleges_public_read" on public.colleges
for select to anon, authenticated using (true);
