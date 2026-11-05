-- The admin desk: health alerts, content added from the panel, its history,
-- and uploaded TOPIK papers.

alter table public.admin_notifications drop constraint if exists admin_notifications_kind_check;
alter table public.admin_notifications add constraint admin_notifications_kind_check
  check (kind in ('deletion', 'ticket', 'ticketReply', 'report', 'signup', 'aiAnswer', 'health'));

-- Rows whose item_id starts with "x-" are new items, not edits of built-in ones.
alter table public.content_overrides drop constraint if exists content_overrides_kind_check;
alter table public.content_overrides add constraint content_overrides_kind_check
  check (kind in ('story', 'grammar', 'topic', 'university', 'word', 'lesson', 'topik'));

-- The state of an item before each save, so a mistake can be undone.
create table if not exists public.content_history (
  id bigint generated always as identity primary key,
  kind text not null,
  item_id text not null,
  data jsonb,
  hidden boolean not null default false,
  saved_by uuid references auth.users(id) on delete set null,
  saved_at timestamptz not null default now()
);

create index if not exists content_history_item_idx on public.content_history (kind, item_id, saved_at desc);
alter table public.content_history enable row level security;
grant select, insert, delete on public.content_history to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('topik-papers', 'topik-papers', true, 52428800, array['application/pdf', 'audio/mpeg'])
on conflict (id) do nothing;

drop policy if exists "Admins upload TOPIK papers" on storage.objects;
create policy "Admins upload TOPIK papers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'topik-papers' and public.is_feedback_admin());

drop policy if exists "Admins replace TOPIK papers" on storage.objects;
create policy "Admins replace TOPIK papers"
  on storage.objects for update to authenticated
  using (bucket_id = 'topik-papers' and public.is_feedback_admin());

drop policy if exists "Admins remove TOPIK papers" on storage.objects;
create policy "Admins remove TOPIK papers"
  on storage.objects for delete to authenticated
  using (bucket_id = 'topik-papers' and public.is_feedback_admin());
