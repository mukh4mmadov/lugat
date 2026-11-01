create table if not exists public.feedback_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.feedback_admins enable row level security;

create or replace function public.is_feedback_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.feedback_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_feedback_admin() from public;
grant execute on function public.is_feedback_admin() to authenticated;

create table if not exists public.feedback_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('bug', 'content', 'audio', 'progress', 'other')),
  message text not null check (char_length(trim(message)) between 10 and 5000),
  route text not null,
  app_version text,
  browser text,
  lesson_id text,
  exercise_mode text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  tags text[] not null default '{}',
  response text not null default '',
  duplicate_of uuid references public.feedback_tickets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_tickets_user_created_idx
  on public.feedback_tickets (user_id, created_at desc);
create index if not exists feedback_tickets_status_created_idx
  on public.feedback_tickets (status, created_at desc);

create table if not exists public.feedback_ticket_admin (
  ticket_id uuid primary key references public.feedback_tickets(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  admin_notes text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.feedback_tickets enable row level security;
alter table public.feedback_ticket_admin enable row level security;

create policy "Users can read their own feedback tickets"
  on public.feedback_tickets for select to authenticated
  using (user_id = auth.uid() or public.is_feedback_admin());

create policy "Authenticated users can create feedback tickets"
  on public.feedback_tickets for insert to authenticated
  with check (user_id = auth.uid());

create policy "Admins can update feedback tickets"
  on public.feedback_tickets for update to authenticated
  using (public.is_feedback_admin())
  with check (public.is_feedback_admin());

create policy "Admins can manage private feedback details"
  on public.feedback_ticket_admin for all to authenticated
  using (public.is_feedback_admin())
  with check (public.is_feedback_admin());

grant select, insert, update on public.feedback_tickets to authenticated;
grant select, insert, update on public.feedback_ticket_admin to authenticated;

create or replace function public.reopen_feedback_ticket(ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.feedback_tickets
  set status = 'open'
  where id = ticket_id
    and user_id = auth.uid()
    and status in ('resolved', 'closed');
  if not found then
    raise exception 'Ticket cannot be reopened';
  end if;
end;
$$;

revoke all on function public.reopen_feedback_ticket(uuid) from public;
grant execute on function public.reopen_feedback_ticket(uuid) to authenticated;

create table if not exists public.feedback_ticket_events (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.feedback_tickets(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  previous_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.feedback_ticket_events enable row level security;

create policy "Admins can read feedback ticket events"
  on public.feedback_ticket_events for select to authenticated
  using (public.is_feedback_admin());

grant select on public.feedback_ticket_events to authenticated;

create or replace function public.record_feedback_ticket_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
    if row(old.status, old.priority, old.tags, old.response, old.duplicate_of)
     is distinct from
      row(new.status, new.priority, new.tags, new.response, new.duplicate_of) then
    insert into public.feedback_ticket_events (
      ticket_id,
      actor_id,
      event_type,
      previous_value,
      new_value
    ) values (
      new.id,
      auth.uid(),
      'ticket_updated',
      jsonb_build_object(
        'status', old.status,
        'priority', old.priority,
        'tags', old.tags,
        'response', old.response,
        'duplicate_of', old.duplicate_of
      ),
      jsonb_build_object(
        'status', new.status,
        'priority', new.priority,
        'tags', new.tags,
        'response', new.response,
        'duplicate_of', new.duplicate_of
      )
    );
  end if;
  return new;
end;
$$;

create or replace trigger feedback_ticket_update_audit
  before update on public.feedback_tickets
  for each row execute function public.record_feedback_ticket_update();

create or replace function public.record_feedback_admin_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  if row(old.assigned_to, old.admin_notes)
     is distinct from row(new.assigned_to, new.admin_notes) then
    insert into public.feedback_ticket_events (
      ticket_id,
      actor_id,
      event_type,
      previous_value,
      new_value
    ) values (
      new.ticket_id,
      auth.uid(),
      'private_details_updated',
      jsonb_build_object('assigned_to', old.assigned_to, 'admin_notes', old.admin_notes),
      jsonb_build_object('assigned_to', new.assigned_to, 'admin_notes', new.admin_notes)
    );
  end if;
  return new;
end;
$$;

create or replace trigger feedback_ticket_admin_update_audit
  before update on public.feedback_ticket_admin
  for each row execute function public.record_feedback_admin_update();
