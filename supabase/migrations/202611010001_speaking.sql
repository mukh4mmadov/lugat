-- Speaking practice: the learner's partner preferences, daily speaking time
-- and session history. Usage and sessions are written by api/speaking-ai.js
-- with the service role; learners can only read their own rows.

alter table public.profiles
  add column if not exists gender text check (gender in ('male', 'female')),
  add column if not exists korean_level text check (korean_level in ('beginner', 'intermediate', 'advanced'));

create table if not exists public.speaking_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Tashkent date, so the allowance resets at local midnight.
  day date not null,
  seconds integer not null default 0,
  turns integer not null default 0,
  primary key (user_id, day)
);

alter table public.speaking_usage enable row level security;

drop policy if exists "Learners read their own speaking usage" on public.speaking_usage;
create policy "Learners read their own speaking usage"
  on public.speaking_usage for select to authenticated
  using (user_id = auth.uid());

grant select on public.speaking_usage to authenticated;
grant select, insert, update, delete on public.speaking_usage to service_role;

create table if not exists public.speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('ai', 'peer')),
  partner_id uuid references auth.users(id) on delete set null,
  topic_id text,
  level text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  seconds integer not null default 0,
  turns integer not null default 0,
  -- Corrections and new words collected during the conversation.
  summary jsonb not null default '{}'::jsonb
);

create index if not exists speaking_sessions_user_idx
  on public.speaking_sessions (user_id, started_at desc);

alter table public.speaking_sessions enable row level security;

drop policy if exists "Learners read their own speaking sessions" on public.speaking_sessions;
create policy "Learners read their own speaking sessions"
  on public.speaking_sessions for select to authenticated
  using (user_id = auth.uid());

grant select on public.speaking_sessions to authenticated;
grant select, insert, update, delete on public.speaking_sessions to service_role;

-- Adds one turn's seconds to today's total and returns the new totals.
create or replace function public.add_speaking_usage(p_user uuid, p_day date, p_seconds integer)
returns table (seconds integer, turns integer)
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.speaking_usage as u (user_id, day, seconds, turns)
  values (p_user, p_day, greatest(p_seconds, 0), 1)
  on conflict (user_id, day) do update
    set seconds = u.seconds + excluded.seconds,
        turns = u.turns + 1
  returning u.seconds, u.turns;
$$;

revoke all on function public.add_speaking_usage(uuid, date, integer) from public, anon, authenticated;
grant execute on function public.add_speaking_usage(uuid, date, integer) to service_role;

insert into public.app_settings (key, value) values
  ('speaking_enabled', 'true'::jsonb),
  ('speaking_free_seconds', '600'::jsonb),
  ('speaking_premium_seconds', '7200'::jsonb)
on conflict (key) do nothing;
