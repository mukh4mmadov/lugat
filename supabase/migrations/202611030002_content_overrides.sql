-- Admin edits to the built-in stories, grammar points and speaking topics.
-- `data` holds only the fields an admin changed; the app lays them over the
-- copy in src/data, and `hidden` takes the item off the site. Written by
-- api/admin.js with the service role.

create table if not exists public.content_overrides (
  kind text not null check (kind in ('story', 'grammar', 'topic')),
  item_id text not null check (char_length(item_id) <= 60),
  data jsonb not null default '{}'::jsonb,
  hidden boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (kind, item_id)
);

alter table public.content_overrides enable row level security;

drop policy if exists "Anyone can read content edits" on public.content_overrides;
create policy "Anyone can read content edits"
  on public.content_overrides for select to anon, authenticated
  using (true);

grant select on public.content_overrides to anon, authenticated;
grant select, insert, update, delete on public.content_overrides to service_role;
