-- Messages admins send inside the site (they reach learners without push),
-- interface text changed from the admin panel, and Premium prices anyone may
-- read while only admins set them.

create table if not exists public.user_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 200),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists user_messages_unread_idx on public.user_messages (user_id, created_at desc) where read_at is null;
alter table public.user_messages enable row level security;
drop policy if exists "Learners read their messages" on public.user_messages;
create policy "Learners read their messages" on public.user_messages for select to authenticated using (user_id = auth.uid());
grant select on public.user_messages to authenticated;
grant select, insert, update, delete on public.user_messages to service_role;

create or replace function public.mark_user_message_read(p_id bigint)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.user_messages set read_at = now() where id = p_id and user_id = auth.uid() and read_at is null;
$$;
revoke all on function public.mark_user_message_read(bigint) from public, anon;
grant execute on function public.mark_user_message_read(bigint) to authenticated;

create table if not exists public.text_overrides (
  language text not null check (language in ('uz', 'en', 'ru')),
  key text not null check (char_length(key) between 1 and 120),
  value text not null check (char_length(value) between 1 and 4000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (language, key)
);

alter table public.text_overrides enable row level security;
drop policy if exists "Anyone reads text overrides" on public.text_overrides;
create policy "Anyone reads text overrides" on public.text_overrides for select to anon, authenticated using (true);
grant select on public.text_overrides to anon, authenticated;
grant select, insert, update, delete on public.text_overrides to service_role;

create or replace function public.get_premium_prices()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select value from public.app_settings where key = 'premium_prices';
$$;
revoke all on function public.get_premium_prices() from public;
grant execute on function public.get_premium_prices() to anon, authenticated;
