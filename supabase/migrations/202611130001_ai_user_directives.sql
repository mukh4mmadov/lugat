-- What admins can tell the AI tutor about one learner: how to treat them, and
-- questions to ask them on the admin's behalf. Questions are asked openly and
-- answering is optional. Only the service role (the API) reads these.

create table if not exists public.ai_user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  behavior text not null default '' check (char_length(behavior) <= 1000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_user_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(question) between 3 and 300),
  status text not null default 'pending' check (status in ('pending', 'answered', 'declined', 'cancelled')),
  answer text not null default '' check (char_length(answer) <= 1000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index if not exists ai_user_requests_user_idx on public.ai_user_requests (user_id, created_at desc);

alter table public.ai_user_settings enable row level security;
alter table public.ai_user_requests enable row level security;
grant select, insert, update, delete on public.ai_user_settings, public.ai_user_requests to service_role;

alter table public.admin_notifications drop constraint if exists admin_notifications_kind_check;
alter table public.admin_notifications add constraint admin_notifications_kind_check
  check (kind in ('deletion', 'ticket', 'ticketReply', 'report', 'signup', 'aiAnswer'));
