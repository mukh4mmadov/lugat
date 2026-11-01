-- AI assistant for feedback: answers what it can as the team, leaves a note
-- and a draft reply for admins otherwise. Admins can turn it off.

alter table public.feedback_messages
  add column if not exists ai boolean not null default false;

alter table public.feedback_tickets
  -- 'answered': the assistant replied; 'handoff': it left the ticket to admins.
  add column if not exists ai_state text check (ai_state in ('answered', 'handoff')),
  -- A reply admins can send as is or edit.
  add column if not exists ai_draft text not null default '' check (char_length(ai_draft) <= 5000),
  -- Set while the assistant works on a ticket so two calls can't both reply.
  add column if not exists ai_lock timestamptz;

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "Admins read settings" on public.app_settings;
create policy "Admins read settings"
  on public.app_settings for select to authenticated
  using (public.is_feedback_admin());

drop policy if exists "Admins change settings" on public.app_settings;
create policy "Admins change settings"
  on public.app_settings for update to authenticated
  using (public.is_feedback_admin())
  with check (public.is_feedback_admin());

grant select, update on public.app_settings to authenticated;
grant select, insert, update, delete on public.app_settings to service_role;

insert into public.app_settings (key, value)
values ('feedback_ai_enabled', 'true'::jsonb)
on conflict (key) do nothing;
