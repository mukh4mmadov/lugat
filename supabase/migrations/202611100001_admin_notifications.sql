-- Admin notifications: every new thing an admin should look at (an account
-- deletion request, a support request or reply, a call report, a new
-- learner) becomes a row here, written by triggers so nothing is missed.
-- Each admin has their own "seen" marks; the bell shows how many are unseen.
-- pushed_at: when the phone/browser push for it went out (api/push.js).

create table if not exists public.admin_notifications (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('deletion', 'ticket', 'ticketReply', 'report', 'signup')),
  data jsonb not null default '{}'::jsonb,
  link text not null default '/admin',
  pushed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_idx on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_unpushed_idx on public.admin_notifications (created_at) where pushed_at is null;

create table if not exists public.admin_notification_reads (
  notification_id bigint not null references public.admin_notifications(id) on delete cascade,
  admin_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, admin_id)
);

alter table public.admin_notifications enable row level security;
alter table public.admin_notification_reads enable row level security;

drop policy if exists "Admins read notifications" on public.admin_notifications;
create policy "Admins read notifications"
  on public.admin_notifications for select to authenticated using (public.is_feedback_admin());
drop policy if exists "Admins read their seen marks" on public.admin_notification_reads;
create policy "Admins read their seen marks"
  on public.admin_notification_reads for select to authenticated using (admin_id = auth.uid());
drop policy if exists "Admins mark notifications seen" on public.admin_notification_reads;
create policy "Admins mark notifications seen"
  on public.admin_notification_reads for insert to authenticated
  with check (admin_id = auth.uid() and public.is_feedback_admin());

grant select on public.admin_notifications to authenticated;
grant select, insert on public.admin_notification_reads to authenticated;
grant select, insert, update, delete on public.admin_notifications, public.admin_notification_reads to service_role;

-- How many notifications this admin has not seen yet.
create or replace function public.admin_unseen_count()
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case when public.is_feedback_admin() then (
    select count(*)::integer from public.admin_notifications n
    where not exists (select 1 from public.admin_notification_reads r where r.notification_id = n.id and r.admin_id = auth.uid())
  ) else 0 end;
$$;

-- Marks every notification seen for this admin.
create or replace function public.admin_mark_all_seen()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_feedback_admin() then raise exception 'not_admin'; end if;
  insert into public.admin_notification_reads (notification_id, admin_id)
  select id, auth.uid() from public.admin_notifications
  on conflict do nothing;
end;
$$;

revoke all on function public.admin_unseen_count(), public.admin_mark_all_seen() from public;
grant execute on function public.admin_unseen_count(), public.admin_mark_all_seen() to authenticated;

create or replace function public.notify_admins()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'account_deletion_requests' then
    insert into public.admin_notifications (kind, data, link)
    values ('deletion', jsonb_build_object('email', new.email, 'reason', left(new.reason, 200)), '/admin/users?user=' || new.user_id);
  elsif tg_table_name = 'feedback_tickets' then
    insert into public.admin_notifications (kind, data, link)
    values ('ticket', jsonb_build_object('category', new.category, 'text', left(coalesce(nullif(new.subject, ''), new.message), 200)), '/admin/feedback?ticket=' || new.id);
  elsif tg_table_name = 'feedback_messages' then
    if new.author_role <> 'user' then return new; end if;
    insert into public.admin_notifications (kind, data, link)
    values ('ticketReply', jsonb_build_object('text', left(new.body, 200)), '/admin/feedback?ticket=' || new.ticket_id);
  elsif tg_table_name = 'speaking_reports' then
    insert into public.admin_notifications (kind, data, link)
    values ('report', jsonb_build_object('reason', new.reason, 'note', left(new.note, 200)), '/admin/speaking');
  elsif tg_table_name = 'profiles' then
    insert into public.admin_notifications (kind, data, link)
    values ('signup', jsonb_build_object('name', trim(coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, ''))), '/admin/users?user=' || new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists notify_admins on public.account_deletion_requests;
create trigger notify_admins after insert on public.account_deletion_requests for each row execute function public.notify_admins();
drop trigger if exists notify_admins on public.feedback_tickets;
create trigger notify_admins after insert on public.feedback_tickets for each row execute function public.notify_admins();
drop trigger if exists notify_admins on public.feedback_messages;
create trigger notify_admins after insert on public.feedback_messages for each row execute function public.notify_admins();
drop trigger if exists notify_admins on public.speaking_reports;
create trigger notify_admins after insert on public.speaking_reports for each row execute function public.notify_admins();
drop trigger if exists notify_admins on public.profiles;
create trigger notify_admins after insert on public.profiles for each row execute function public.notify_admins();

-- The bell updates live.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'admin_notifications') then
    alter publication supabase_realtime add table public.admin_notifications;
  end if;
end $$;
