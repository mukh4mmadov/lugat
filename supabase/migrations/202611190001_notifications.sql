alter table public.user_messages add column if not exists kind text not null default 'admin';
alter table public.user_messages add column if not exists link text;
alter table public.user_messages add column if not exists important boolean not null default false;
alter table public.user_messages add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.user_messages drop constraint if exists user_messages_kind_check;
alter table public.user_messages add constraint user_messages_kind_check
  check (kind in ('admin', 'feedback', 'premium', 'premium_expiring', 'referral_joined', 'referral_qualified', 'streak'));
alter table public.user_messages drop constraint if exists user_messages_link_check;
alter table public.user_messages add constraint user_messages_link_check
  check (link is null or (link ~ '^/[A-Za-z0-9/_?=&%.-]*$' and char_length(link) <= 200));

alter table public.user_messages alter column title drop not null;
alter table public.user_messages alter column body drop not null;
alter table public.user_messages drop constraint if exists user_messages_title_check;
alter table public.user_messages drop constraint if exists user_messages_body_check;
alter table public.user_messages add constraint user_messages_title_check
  check (title is null or char_length(title) between 1 and 80);
alter table public.user_messages add constraint user_messages_body_check
  check (body is null or char_length(body) between 1 and 200);
alter table public.user_messages drop constraint if exists user_messages_admin_text_check;
alter table public.user_messages add constraint user_messages_admin_text_check
  check (kind <> 'admin' or (title is not null and body is not null));

create index if not exists user_messages_user_idx on public.user_messages (user_id, created_at desc);

create or replace function public.mark_all_user_messages_read()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.user_messages set read_at = now() where user_id = auth.uid() and read_at is null;
$$;
revoke all on function public.mark_all_user_messages_read() from public, anon;
grant execute on function public.mark_all_user_messages_read() to authenticated;

create or replace function public.notify_feedback_reply()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid;
begin
  if new.author_role <> 'admin' or new.internal then
    return new;
  end if;
  select user_id into v_user from feedback_tickets where id = new.ticket_id;
  if v_user is null then
    return new;
  end if;
  delete from user_messages
   where user_id = v_user and kind = 'feedback' and read_at is null and data->>'ticket' = new.ticket_id::text;
  insert into user_messages (user_id, kind, link, data)
  values (v_user, 'feedback', '/feedback/' || new.ticket_id, jsonb_build_object('ticket', new.ticket_id, 'preview', left(new.body, 140)));
  return new;
end;
$$;

drop trigger if exists feedback_reply_notifies on public.feedback_messages;
create trigger feedback_reply_notifies
  after insert on public.feedback_messages
  for each row execute function public.notify_feedback_reply();

create or replace function public.notify_referral()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
begin
  select nullif(trim(coalesce(first_name, '') || ' ' || left(coalesce(last_name, ''), 1)), '') into v_name
    from profiles where id = new.referred;
  if tg_op = 'INSERT' and not new.revoked then
    insert into user_messages (user_id, kind, link, data)
    values (new.referrer, 'referral_joined', '/speaking?tab=invite', jsonb_build_object('name', v_name));
  elsif tg_op = 'UPDATE' and old.qualified_at is null and new.qualified_at is not null and not new.revoked then
    insert into user_messages (user_id, kind, link, data)
    values (new.referrer, 'referral_qualified', '/speaking?tab=invite', jsonb_build_object('name', v_name));
  end if;
  return new;
end;
$$;

drop trigger if exists referral_notifies on public.referrals;
create trigger referral_notifies
  after insert or update of qualified_at on public.referrals
  for each row execute function public.notify_referral();

revoke all on function public.notify_feedback_reply() from public, anon, authenticated;
revoke all on function public.notify_referral() from public, anon, authenticated;
