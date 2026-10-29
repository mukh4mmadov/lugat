-- Feedback v2: every report becomes a conversation between the learner and
-- the team, with unread state on both sides, internal admin notes, saved
-- replies, ratings and safer, rate-limited creation.

-- 1. Ticket columns -----------------------------------------------------------

alter table public.feedback_tickets drop constraint if exists feedback_tickets_category_check;
alter table public.feedback_tickets add constraint feedback_tickets_category_check
  check (category in ('bug', 'content', 'audio', 'progress', 'idea', 'other'));

alter table public.feedback_tickets
  add column if not exists subject text not null default '' check (char_length(subject) <= 120),
  add column if not exists language text,
  add column if not exists screen text,
  add column if not exists last_message_at timestamptz,
  add column if not exists last_message_by text not null default 'user' check (last_message_by in ('user', 'admin')),
  add column if not exists first_response_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists user_unread boolean not null default false,
  add column if not exists admin_unread boolean not null default true,
  add column if not exists rating smallint check (rating between 1 and 5),
  add column if not exists rating_comment text not null default '' check (char_length(rating_comment) <= 1000);

create index if not exists feedback_tickets_last_message_idx
  on public.feedback_tickets (last_message_at desc);

-- 2. Messages -----------------------------------------------------------------

create table if not exists public.feedback_messages (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.feedback_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_role text not null check (author_role in ('user', 'admin')),
  -- Internal notes are only visible to admins.
  internal boolean not null default false,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now(),
  check (not internal or author_role = 'admin')
);

create index if not exists feedback_messages_ticket_idx
  on public.feedback_messages (ticket_id, created_at);

alter table public.feedback_messages enable row level security;

create policy "Users read public messages on their tickets; admins read all"
  on public.feedback_messages for select to authenticated
  using (
    public.is_feedback_admin()
    or (
      not internal
      and exists (
        select 1 from public.feedback_tickets t
        where t.id = ticket_id and t.user_id = auth.uid()
      )
    )
  );

-- Learners reply through reply_feedback_ticket(); admins insert directly.
create policy "Admins write messages"
  on public.feedback_messages for insert to authenticated
  with check (public.is_feedback_admin() and author_role = 'admin' and author_id = auth.uid());

create policy "Admins delete their internal notes"
  on public.feedback_messages for delete to authenticated
  using (public.is_feedback_admin() and internal and author_id = auth.uid());

grant select, insert, delete on public.feedback_messages to authenticated;
grant select, insert, update, delete on public.feedback_messages to service_role;

-- 3. Move existing replies and notes into the conversation -------------------
-- Done before the message trigger exists so old replies don't flip statuses.

alter table public.feedback_tickets disable trigger feedback_ticket_update_audit;

insert into public.feedback_messages (ticket_id, author_role, body, created_at)
select t.id, 'admin', t.response, t.updated_at
from public.feedback_tickets t
where trim(t.response) <> ''
  and not exists (select 1 from public.feedback_messages m where m.ticket_id = t.id and not m.internal);

insert into public.feedback_messages (ticket_id, author_role, internal, body, created_at)
select a.ticket_id, 'admin', true, a.admin_notes, a.updated_at
from public.feedback_ticket_admin a
where trim(a.admin_notes) <> ''
  and not exists (select 1 from public.feedback_messages m where m.ticket_id = a.ticket_id and m.internal);

update public.feedback_tickets t
set last_message_at = coalesce(
      (select max(m.created_at) from public.feedback_messages m where m.ticket_id = t.id and not m.internal),
      t.created_at),
    last_message_by = case when trim(t.response) <> '' then 'admin' else 'user' end,
    first_response_at = case when trim(t.response) <> '' then t.updated_at end,
    resolved_at = case when t.status in ('resolved', 'closed') then t.updated_at end,
    admin_unread = (t.status = 'open' and trim(t.response) = '')
where t.last_message_at is null;

alter table public.feedback_tickets enable trigger feedback_ticket_update_audit;

alter table public.feedback_tickets alter column last_message_at set default now();
alter table public.feedback_tickets alter column last_message_at set not null;

-- 4. Keep ticket state in step with the conversation ------------------------

create or replace function public.record_feedback_message()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.internal then
    return new;
  end if;
  update public.feedback_tickets
  set last_message_at = new.created_at,
      last_message_by = new.author_role,
      user_unread = case when new.author_role = 'admin' then true else user_unread end,
      admin_unread = case when new.author_role = 'user' then true else admin_unread end,
      first_response_at = case
        when new.author_role = 'admin' and first_response_at is null then new.created_at
        else first_response_at end,
      -- A learner writing on a finished ticket reopens it; the first team
      -- reply on a new ticket picks it up.
      status = case
        when new.author_role = 'user' and status in ('resolved', 'closed') then 'open'
        when new.author_role = 'admin' and status = 'open' then 'in_progress'
        else status end
  where id = new.ticket_id;
  return new;
end;
$$;

create or replace trigger feedback_message_insert
  after insert on public.feedback_messages
  for each row execute function public.record_feedback_message();

-- Same audit as before, plus resolved_at and telling the learner when the
-- team changes the status of their ticket.
create or replace function public.record_feedback_ticket_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status then
    if new.status in ('resolved', 'closed') and old.status not in ('resolved', 'closed') then
      new.resolved_at = now();
    elsif new.status in ('open', 'in_progress') then
      new.resolved_at = null;
      new.rating = null;
      new.rating_comment = '';
    end if;
    if auth.uid() is distinct from new.user_id then
      new.user_unread = true;
    end if;
  end if;
  if row(old.status, old.priority, old.tags, old.duplicate_of)
     is distinct from
     row(new.status, new.priority, new.tags, new.duplicate_of) then
    insert into public.feedback_ticket_events (ticket_id, actor_id, event_type, previous_value, new_value)
    values (
      new.id,
      auth.uid(),
      'ticket_updated',
      jsonb_build_object('status', old.status, 'priority', old.priority, 'tags', old.tags, 'duplicate_of', old.duplicate_of),
      jsonb_build_object('status', new.status, 'priority', new.priority, 'tags', new.tags, 'duplicate_of', new.duplicate_of)
    );
  end if;
  return new;
end;
$$;

-- Assignment is logged; notes moved into the conversation.
create or replace function public.record_feedback_admin_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  previous uuid := case when tg_op = 'UPDATE' then old.assigned_to end;
begin
  new.updated_at = now();
  if previous is distinct from new.assigned_to then
    insert into public.feedback_ticket_events (ticket_id, actor_id, event_type, previous_value, new_value)
    values (
      new.ticket_id,
      auth.uid(),
      'assigned',
      jsonb_build_object('assigned_to', previous),
      jsonb_build_object('assigned_to', new.assigned_to)
    );
  end if;
  return new;
end;
$$;

create or replace trigger feedback_ticket_admin_insert_audit
  before insert on public.feedback_ticket_admin
  for each row execute function public.record_feedback_admin_update();

-- 5. Learner actions ----------------------------------------------------------
-- Learners no longer insert tickets directly, so they can't set status,
-- priority or a reply themselves.

drop policy if exists "Authenticated users can create feedback tickets" on public.feedback_tickets;
revoke insert on public.feedback_tickets from authenticated;

create policy "Admins can delete feedback tickets"
  on public.feedback_tickets for delete to authenticated
  using (public.is_feedback_admin());
grant delete on public.feedback_tickets to authenticated;

create or replace function public.create_feedback_ticket(
  p_category text,
  p_subject text,
  p_message text,
  p_route text default '/',
  p_lesson_id text default null,
  p_exercise_mode text default null,
  p_app_version text default null,
  p_browser text default null,
  p_language text default null,
  p_screen text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if (select count(*) from public.feedback_tickets
      where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;
  insert into public.feedback_tickets (
    user_id, category, subject, message, route, lesson_id, exercise_mode,
    app_version, browser, language, screen
  ) values (
    auth.uid(),
    p_category,
    left(trim(coalesce(p_subject, '')), 120),
    trim(p_message),
    left(coalesce(nullif(trim(p_route), ''), '/'), 300),
    left(p_lesson_id, 20),
    left(p_exercise_mode, 40),
    left(p_app_version, 40),
    left(p_browser, 500),
    left(p_language, 10),
    left(p_screen, 40)
  )
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.reply_feedback_ticket(p_ticket_id uuid, p_body text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.feedback_tickets where id = p_ticket_id and user_id = auth.uid()) then
    raise exception 'ticket_not_found';
  end if;
  if (select count(*) from public.feedback_messages
      where author_id = auth.uid() and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'rate_limited';
  end if;
  insert into public.feedback_messages (ticket_id, author_id, author_role, body)
  values (p_ticket_id, auth.uid(), 'user', trim(p_body));
  update public.feedback_tickets set user_unread = false where id = p_ticket_id;
end;
$$;

create or replace function public.close_feedback_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.feedback_tickets
  set status = 'resolved', admin_unread = true
  where id = p_ticket_id and user_id = auth.uid() and status in ('open', 'in_progress');
  if not found then
    raise exception 'ticket_not_found';
  end if;
end;
$$;

create or replace function public.rate_feedback_ticket(p_ticket_id uuid, p_rating int, p_comment text default '')
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_rating not between 1 and 5 then
    raise exception 'invalid_rating';
  end if;
  update public.feedback_tickets
  set rating = p_rating, rating_comment = left(trim(coalesce(p_comment, '')), 1000)
  where id = p_ticket_id and user_id = auth.uid() and status in ('resolved', 'closed');
  if not found then
    raise exception 'ticket_not_found';
  end if;
  insert into public.feedback_ticket_events (ticket_id, actor_id, event_type, new_value)
  values (p_ticket_id, auth.uid(), 'rated', jsonb_build_object('rating', p_rating));
end;
$$;

create or replace function public.mark_feedback_ticket_read(p_ticket_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.feedback_tickets set user_unread = false
  where id = p_ticket_id and user_id = auth.uid() and user_unread;
$$;

revoke all on function public.create_feedback_ticket(text, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.reply_feedback_ticket(uuid, text) from public;
revoke all on function public.close_feedback_ticket(uuid) from public;
revoke all on function public.rate_feedback_ticket(uuid, int, text) from public;
revoke all on function public.mark_feedback_ticket_read(uuid) from public;
grant execute on function public.create_feedback_ticket(text, text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.reply_feedback_ticket(uuid, text) to authenticated;
grant execute on function public.close_feedback_ticket(uuid) to authenticated;
grant execute on function public.rate_feedback_ticket(uuid, int, text) to authenticated;
grant execute on function public.mark_feedback_ticket_read(uuid) to authenticated;

-- 6. Admin helpers ------------------------------------------------------------

-- Names and emails for the given users plus every admin, so the inbox can show
-- who wrote a ticket and offer admins for assignment. Admins only.
create or replace function public.feedback_people(p_ids uuid[])
returns table (user_id uuid, email text, name text, is_admin boolean, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_feedback_admin() then
    raise exception 'forbidden';
  end if;
  return query
  select u.id,
         u.email::text,
         trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')),
         exists (select 1 from public.feedback_admins a where a.user_id = u.id),
         u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = any(coalesce(p_ids, '{}'))
     or u.id in (select a.user_id from public.feedback_admins a);
end;
$$;

revoke all on function public.feedback_people(uuid[]) from public;
grant execute on function public.feedback_people(uuid[]) to authenticated;

create table if not exists public.feedback_saved_replies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 80),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feedback_saved_replies enable row level security;

create policy "Admins manage saved replies"
  on public.feedback_saved_replies for all to authenticated
  using (public.is_feedback_admin())
  with check (public.is_feedback_admin());

grant select, insert, update, delete on public.feedback_saved_replies to authenticated;
grant select, insert, update, delete on public.feedback_saved_replies to service_role;
