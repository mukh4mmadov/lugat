-- Admin tools: a log of every admin action, a record of premium sales, and a
-- site-wide announcement anyone can read. Written by api/admin.js with the
-- service role.

create table if not exists public.admin_audit (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_user uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_created_idx on public.admin_audit (created_at desc);

alter table public.admin_audit enable row level security;
grant select, insert on public.admin_audit to service_role;

create table if not exists public.premium_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  admin_id uuid references auth.users(id) on delete set null,
  days integer not null,
  amount integer not null default 0,
  note text not null default '',
  premium_until timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists premium_log_created_idx on public.premium_log (created_at desc);

alter table public.premium_log enable row level security;
grant select, insert on public.premium_log to service_role;

-- The banner shown at the top of the site, readable without signing in.
create or replace function public.get_announcement()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select value from public.app_settings
  where key = 'announcement'
    and coalesce((value->>'active')::boolean, false)
    and (value->>'until' is null or (value->>'until')::timestamptz > now());
$$;

revoke all on function public.get_announcement() from public;
grant execute on function public.get_announcement() to anon, authenticated;

insert into public.app_settings (key, value) values
  ('ai_free_daily', '10'::jsonb),
  ('ai_premium_daily', '200'::jsonb),
  ('grammar_free_daily', '5'::jsonb),
  ('announcement', '{"active": false, "text": "", "link": "", "until": null}'::jsonb)
on conflict (key) do nothing;
