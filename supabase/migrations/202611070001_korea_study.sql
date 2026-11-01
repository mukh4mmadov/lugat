-- "Koreyada o'qish": learners' study plans, AI admission documents and
-- interview practice, and daily usage for the AI limits. The university
-- catalog itself is static (src/data/korea/universities.js, built from
-- official data); admins correct it through content_overrides.

alter table public.content_overrides drop constraint if exists content_overrides_kind_check;
alter table public.content_overrides
  add constraint content_overrides_kind_check check (kind in ('story', 'grammar', 'topic', 'university'));

create table if not exists public.study_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  targets text[] not null default '{}',
  intake text,
  degree text check (degree in ('language', 'bachelor', 'master', 'doctor')),
  topik_goal integer check (topik_goal between 1 and 6),
  checklist jsonb not null default '{}'::jsonb,
  applications jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_plans enable row level security;
drop policy if exists "Learners manage their study plan" on public.study_plans;
create policy "Learners manage their study plan"
  on public.study_plans for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.study_plans to authenticated;
grant select, insert, update, delete on public.study_plans to service_role;

create table if not exists public.admission_docs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('sop', 'studyplan', 'gks_statement', 'gks_plan', 'review')),
  language text not null check (language in ('ko', 'en')),
  university_id text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admission_docs_user_idx on public.admission_docs (user_id, created_at desc);
alter table public.admission_docs enable row level security;
drop policy if exists "Learners read their documents" on public.admission_docs;
create policy "Learners read their documents"
  on public.admission_docs for select to authenticated using (user_id = auth.uid());
drop policy if exists "Learners delete their documents" on public.admission_docs;
create policy "Learners delete their documents"
  on public.admission_docs for delete to authenticated using (user_id = auth.uid());
grant select, delete on public.admission_docs to authenticated;
grant select, insert, update, delete on public.admission_docs to service_role;

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('university', 'gks')),
  language text not null check (language in ('ko', 'en')),
  university_id text,
  turns jsonb not null default '[]'::jsonb,
  summary jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists interview_sessions_user_idx on public.interview_sessions (user_id, started_at desc);
alter table public.interview_sessions enable row level security;
drop policy if exists "Learners read their interviews" on public.interview_sessions;
create policy "Learners read their interviews"
  on public.interview_sessions for select to authenticated using (user_id = auth.uid());
grant select on public.interview_sessions to authenticated;
grant select, insert, update, delete on public.interview_sessions to service_role;

-- Uses of each AI tool per Tashkent day, for the limits.
create table if not exists public.study_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('consult', 'doc', 'interview')),
  count integer not null default 0,
  primary key (user_id, day, kind)
);

alter table public.study_usage enable row level security;
grant select, insert, update, delete on public.study_usage to service_role;

insert into public.app_settings (key, value) values
  ('study_consult_free_daily', '5'::jsonb),
  ('study_consult_premium_daily', '50'::jsonb),
  ('study_doc_free_weekly', '1'::jsonb),
  ('study_doc_premium_daily', '10'::jsonb),
  ('study_interview_free_weekly', '1'::jsonb),
  ('study_interview_premium_daily', '10'::jsonb)
on conflict (key) do nothing;
