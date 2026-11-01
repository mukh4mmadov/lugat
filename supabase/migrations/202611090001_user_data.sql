-- Everything a learner does is kept in the account, so it can always be found
-- later: TOPIK attempts, grammar sentence checks and account deletion
-- requests. Speaking transcripts go into speaking_sessions.summary.
-- (The older server-graded topik_attempts table is no longer written to; its
-- rows are kept as history.)
-- Nothing here can be deleted by the learner; a deleted TOPIK attempt is only
-- hidden, and accounts are deleted by an admin after a request.

create table if not exists public.user_topik_attempts (
  id text primary key check (char_length(id) <= 80),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id text not null,
  status text not null check (status in ('in_progress', 'submitted')),
  started_at bigint,
  submitted_at bigint,
  elapsed_seconds integer,
  answers jsonb not null default '{}'::jsonb,
  result jsonb,
  review jsonb,
  state jsonb not null default '{}'::jsonb,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists user_topik_attempts_user_idx on public.user_topik_attempts (user_id, updated_at desc);
alter table public.user_topik_attempts enable row level security;

drop policy if exists "Learners read their TOPIK attempts" on public.user_topik_attempts;
create policy "Learners read their TOPIK attempts"
  on public.user_topik_attempts for select to authenticated using (user_id = auth.uid());
drop policy if exists "Learners save their TOPIK attempts" on public.user_topik_attempts;
create policy "Learners save their TOPIK attempts"
  on public.user_topik_attempts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Learners update their TOPIK attempts" on public.user_topik_attempts;
create policy "Learners update their TOPIK attempts"
  on public.user_topik_attempts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update on public.user_topik_attempts to authenticated;
grant select, insert, update, delete on public.user_topik_attempts to service_role;

-- A submitted attempt is final: only the AI review and the hidden flag change.
create or replace function public.keep_submitted_topik_attempt()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.status = 'submitted' then
    new.status := old.status;
    new.variant_id := old.variant_id;
    new.started_at := old.started_at;
    new.submitted_at := old.submitted_at;
    new.elapsed_seconds := old.elapsed_seconds;
    new.answers := old.answers;
    new.result := old.result;
  end if;
  new.user_id := old.user_id;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists keep_submitted_topik_attempt on public.user_topik_attempts;
create trigger keep_submitted_topik_attempt
  before update on public.user_topik_attempts
  for each row execute function public.keep_submitted_topik_attempt();

create table if not exists public.grammar_checks (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  point_id text not null,
  sentence text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists grammar_checks_user_idx on public.grammar_checks (user_id, created_at desc);
alter table public.grammar_checks enable row level security;
drop policy if exists "Learners read their grammar checks" on public.grammar_checks;
create policy "Learners read their grammar checks"
  on public.grammar_checks for select to authenticated using (user_id = auth.uid());
grant select on public.grammar_checks to authenticated;
grant select, insert, update, delete on public.grammar_checks to service_role;

create table if not exists public.account_deletion_requests (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  reason text not null default '' check (char_length(reason) <= 1000),
  status text not null default 'open' check (status in ('open', 'approved', 'rejected')),
  admin_note text not null default '',
  handled_by uuid references auth.users(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists account_deletion_requests_created_idx on public.account_deletion_requests (created_at desc);
alter table public.account_deletion_requests enable row level security;
drop policy if exists "Learners read their deletion requests" on public.account_deletion_requests;
create policy "Learners read their deletion requests"
  on public.account_deletion_requests for select to authenticated using (user_id = auth.uid());
grant select on public.account_deletion_requests to authenticated;
grant select, insert, update, delete on public.account_deletion_requests to service_role;
