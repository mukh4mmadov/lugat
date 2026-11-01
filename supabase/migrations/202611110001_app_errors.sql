-- Errors learners hit in the browser (a page crash, an uncaught error, a
-- part of the site that failed to load), so admins can see and fix them.
-- Anyone may report; only the service role (the admin API) reads them.

create table if not exists public.app_errors (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  kind text not null check (kind in ('boundary', 'error', 'rejection', 'chunk')),
  message text not null check (char_length(message) <= 500),
  stack text not null default '' check (char_length(stack) <= 4000),
  path text not null default '' check (char_length(path) <= 300),
  user_agent text not null default '' check (char_length(user_agent) <= 300),
  version text not null default '' check (char_length(version) <= 60),
  created_at timestamptz not null default now()
);

create index if not exists app_errors_created_idx on public.app_errors (created_at desc);
alter table public.app_errors enable row level security;

drop policy if exists "Anyone reports errors" on public.app_errors;
create policy "Anyone reports errors"
  on public.app_errors for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

grant insert on public.app_errors to anon, authenticated;
grant select, insert, delete on public.app_errors to service_role;
