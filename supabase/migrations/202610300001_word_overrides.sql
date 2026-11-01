-- Corrections to the built-in vocabulary, made by admins from the dashboard.
-- The app applies them on top of data/lessonN.json, so a fix goes live for
-- everyone without a redeploy. Any column left null keeps the built-in value.

create table if not exists public.word_overrides (
  word_key text primary key check (word_key ~ '^[0-9]+-[0-9]+$'),
  uzbek text check (char_length(uzbek) <= 300),
  english text check (char_length(english) <= 300),
  russian text check (char_length(russian) <= 300),
  romanization text check (char_length(romanization) <= 200),
  example jsonb,
  needs_review boolean,
  note text not null default '' check (char_length(note) <= 1000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.word_overrides enable row level security;

-- Everyone (signed in or not) reads the corrections; only admins change them.
create policy "Anyone can read word corrections"
  on public.word_overrides for select to anon, authenticated
  using (true);

create policy "Admins manage word corrections"
  on public.word_overrides for all to authenticated
  using (public.is_feedback_admin())
  with check (public.is_feedback_admin());

grant select on public.word_overrides to anon, authenticated;
grant insert, update, delete on public.word_overrides to authenticated;
grant select, insert, update, delete on public.word_overrides to service_role;

create or replace function public.touch_word_override()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

create or replace trigger word_override_touch
  before insert or update on public.word_overrides
  for each row execute function public.touch_word_override();
