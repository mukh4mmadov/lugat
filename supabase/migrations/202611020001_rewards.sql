-- Premium days earned by learners (streak rewards now, invites later).
-- Written by the API with the service role; learners read their own.

create table if not exists public.reward_claims (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  days integer not null default 0,
  claimed_at timestamptz not null default now()
);

create index if not exists reward_claims_user_kind_idx
  on public.reward_claims (user_id, kind, claimed_at desc);

alter table public.reward_claims enable row level security;

drop policy if exists "Learners read their own rewards" on public.reward_claims;
create policy "Learners read their own rewards"
  on public.reward_claims for select to authenticated
  using (user_id = auth.uid());

grant select on public.reward_claims to authenticated;
grant select, insert, update, delete on public.reward_claims to service_role;
