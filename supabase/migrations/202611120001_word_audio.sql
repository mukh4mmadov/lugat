-- Word pronunciations kept in Supabase: AI voices (Gemini TTS, each checked
-- by transcribing it back) and recordings by real people made on the
-- recording page. Files live in the public "word-audio" bucket; anyone can
-- read the list, only the admin API (service role) writes it.

create table if not exists public.word_audio (
  word text primary key check (char_length(word) between 1 and 60),
  source text not null check (source in ('human', 'ai')),
  path text not null check (char_length(path) <= 200),
  speaker text not null default '' check (char_length(speaker) <= 80),
  model text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.word_audio enable row level security;
drop policy if exists "Anyone reads word audio" on public.word_audio;
create policy "Anyone reads word audio" on public.word_audio for select to anon, authenticated using (true);
grant select on public.word_audio to anon, authenticated;
grant select, insert, update, delete on public.word_audio to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('word-audio', 'word-audio', true, 2097152, array['audio/wav', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
