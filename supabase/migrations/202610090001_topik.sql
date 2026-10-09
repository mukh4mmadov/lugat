create table if not exists public.topik_exams (
  id text primary key,
  exam_number integer not null,
  exam_title text not null,
  form text not null default 'B',
  level1_min_score integer not null default 80,
  level2_min_score integer not null default 140,
  created_at timestamptz not null default now()
);

create table if not exists public.topik_variants (
  id text primary key,
  exam_id text not null references public.topik_exams(id) on delete cascade,
  mode text not null check (mode in ('mock', 'listening', 'reading')),
  section text check (section in ('listening', 'reading')),
  duration_seconds integer,
  content_ready boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  check ((mode = 'mock' and section is null and duration_seconds is not null) or
         (mode = 'listening' and section = 'listening' and duration_seconds is null) or
         (mode = 'reading' and section = 'reading' and duration_seconds is null))
);

create table if not exists public.topik_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id text not null references public.topik_exams(id) on delete cascade,
  section text not null check (section in ('listening', 'reading')),
  question_number integer not null check (question_number > 0),
  points integer not null check (points > 0),
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (exam_id, question_number)
);

create index if not exists topik_questions_variant_order_idx
  on public.topik_questions (exam_id, question_number);

create table if not exists public.topik_answer_keys (
  question_id uuid primary key references public.topik_questions(id) on delete cascade,
  correct_option text not null,
  explanation_ko text not null default ''
);

create table if not exists public.topik_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id text not null references public.topik_variants(id),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  elapsed_seconds integer,
  listening_score integer not null default 0,
  reading_score integer not null default 0,
  total_score integer not null default 0,
  estimated_level integer check (estimated_level in (1, 2)),
  created_at timestamptz not null default now(),
  check ((status = 'in_progress' and submitted_at is null) or
         (status = 'submitted' and submitted_at is not null))
);

create index if not exists topik_attempts_user_history_idx
  on public.topik_attempts (user_id, created_at desc);

create table if not exists public.topik_attempt_answers (
  attempt_id uuid not null references public.topik_attempts(id) on delete cascade,
  question_id uuid not null references public.topik_questions(id) on delete cascade,
  selected_option text,
  correct_option text,
  is_correct boolean,
  awarded_points integer not null default 0,
  primary key (attempt_id, question_id)
);

alter table public.topik_variants enable row level security;
alter table public.topik_exams enable row level security;
alter table public.topik_questions enable row level security;
alter table public.topik_answer_keys enable row level security;
alter table public.topik_attempts enable row level security;
alter table public.topik_attempt_answers enable row level security;

drop policy if exists "Authenticated users can read published TOPIK variants" on public.topik_variants;
create policy "Authenticated users can read published TOPIK variants"
  on public.topik_variants for select to authenticated using (is_published);
drop policy if exists "Authenticated users can read TOPIK exams" on public.topik_exams;
create policy "Authenticated users can read TOPIK exams"
  on public.topik_exams for select to authenticated
  using (exists (select 1 from public.topik_variants v where v.exam_id = id and v.is_published));
drop policy if exists "Authenticated users can read TOPIK questions" on public.topik_questions;
create policy "Authenticated users can read TOPIK questions"
  on public.topik_questions for select to authenticated
  using (exists (select 1 from public.topik_exams e join public.topik_variants v on v.exam_id = e.id where e.id = topik_questions.exam_id and v.is_published));
drop policy if exists "Users can read their own TOPIK attempts" on public.topik_attempts;
create policy "Users can read their own TOPIK attempts"
  on public.topik_attempts for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can read answers from their own TOPIK attempts" on public.topik_attempt_answers;
create policy "Users can read answers from their own TOPIK attempts"
  on public.topik_attempt_answers for select to authenticated
  using (exists (select 1 from public.topik_attempts a where a.id = attempt_id and a.user_id = auth.uid()));

grant select on public.topik_exams, public.topik_variants, public.topik_questions,
  public.topik_attempts, public.topik_attempt_answers to authenticated;
revoke all on public.topik_answer_keys from anon, authenticated;

create or replace function public.start_topik_attempt(p_variant_id text)
returns public.topik_attempts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt public.topik_attempts;
  v_expected_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.topik_variants where id = p_variant_id and is_published) then
    raise exception 'TOPIK variant not found';
  end if;
  select case mode
    when 'mock' then 70
    when 'listening' then 30
    else 40
  end into v_expected_count
  from public.topik_variants where id = p_variant_id;
  if not exists (select 1 from public.topik_variants where id = p_variant_id and content_ready) then
    raise exception 'TOPIK content is not available yet';
  end if;
  if not exists (
    select 1 from public.topik_questions q
    join public.topik_variants v on v.exam_id = q.exam_id
    where v.id = p_variant_id and (v.section is null or q.section = v.section)
  ) then
    raise exception 'TOPIK content is not available yet';
  end if;
  if (
    select count(*) from public.topik_questions q
    join public.topik_variants v on v.exam_id = q.exam_id
    where v.id = p_variant_id and (v.section is null or q.section = v.section)
  ) <> v_expected_count then
    raise exception 'TOPIK content is not complete';
  end if;
  if exists (
    select 1 from public.topik_questions q
    join public.topik_variants v on v.exam_id = q.exam_id
    left join public.topik_answer_keys k on k.question_id = q.id
    where v.id = p_variant_id
      and (v.section is null or q.section = v.section)
      and k.question_id is null
  ) then
    raise exception 'TOPIK answer key is incomplete';
  end if;
  insert into public.topik_attempts (user_id, variant_id)
  values (auth.uid(), p_variant_id)
  returning * into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.save_topik_answer(p_attempt_id uuid, p_question_id uuid, p_selected_option text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_selected_option is not null and p_selected_option !~ '^[1-4]$' then
    raise exception 'Invalid answer option';
  end if;
  insert into public.topik_attempt_answers (attempt_id, question_id, selected_option)
  select a.id, q.id, p_selected_option
  from public.topik_attempts a
  join public.topik_variants v on v.id = a.variant_id
  join public.topik_questions q on q.id = p_question_id and q.exam_id = v.exam_id and (v.section is null or q.section = v.section)
  where a.id = p_attempt_id and a.user_id = auth.uid() and a.status = 'in_progress'
  on conflict (attempt_id, question_id) do update
    set selected_option = excluded.selected_option;
  if not found then raise exception 'Attempt is not active'; end if;
end;
$$;

create or replace function public.submit_topik_attempt(p_attempt_id uuid)
returns public.topik_attempts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempt public.topik_attempts;
  v_variant public.topik_variants;
  v_elapsed integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_attempt from public.topik_attempts
  where id = p_attempt_id and user_id = auth.uid() for update;
  if not found then raise exception 'Attempt not found'; end if;
  if v_attempt.status = 'submitted' then return v_attempt; end if;
  select * into v_variant from public.topik_variants where id = v_attempt.variant_id;
  v_elapsed := greatest(0, floor(extract(epoch from (now() - v_attempt.started_at)))::integer);
  if exists (
    select 1 from public.topik_questions q
    left join public.topik_answer_keys k on k.question_id = q.id
    where q.exam_id = v_variant.exam_id
      and (v_variant.section is null or q.section = v_variant.section)
      and k.question_id is null
  ) then
    raise exception 'TOPIK answer key is incomplete';
  end if;

  insert into public.topik_attempt_answers (attempt_id, question_id)
  select v_attempt.id, q.id
  from public.topik_questions q
  where q.exam_id = v_variant.exam_id
    and (v_variant.section is null or q.section = v_variant.section)
  on conflict (attempt_id, question_id) do nothing;

  update public.topik_attempt_answers aa
  set correct_option = k.correct_option,
      is_correct = (aa.selected_option = k.correct_option),
      awarded_points = case when aa.selected_option = k.correct_option then q.points else 0 end
  from public.topik_questions q
  join public.topik_answer_keys k on k.question_id = q.id
  where aa.attempt_id = v_attempt.id and aa.question_id = q.id;

  update public.topik_attempts a
  set status = 'submitted', submitted_at = now(), elapsed_seconds = v_elapsed,
      listening_score = coalesce((select sum(aa.awarded_points)::integer from public.topik_attempt_answers aa join public.topik_questions q on q.id = aa.question_id where aa.attempt_id = a.id and q.section = 'listening'), 0),
      reading_score = coalesce((
        select round(sum(aa.awarded_points)::numeric * 100 / nullif(sum(q.points), 0))::integer
        from public.topik_attempt_answers aa
        join public.topik_questions q on q.id = aa.question_id
        where aa.attempt_id = a.id and q.section = 'reading'
      ), 0),
      total_score =
        coalesce((select sum(aa.awarded_points)::integer from public.topik_attempt_answers aa join public.topik_questions q on q.id = aa.question_id where aa.attempt_id = a.id and q.section = 'listening'), 0)
        + coalesce((
          select round(sum(aa.awarded_points)::numeric * 100 / nullif(sum(q.points), 0))::integer
          from public.topik_attempt_answers aa
          join public.topik_questions q on q.id = aa.question_id
          where aa.attempt_id = a.id and q.section = 'reading'
        ), 0)
  where a.id = v_attempt.id
  returning * into v_attempt;

  if v_variant.mode = 'mock' then
    update public.topik_attempts set estimated_level = case
      when total_score >= (select level2_min_score from public.topik_exams where id = v_variant.exam_id) then 2
      when total_score >= (select level1_min_score from public.topik_exams where id = v_variant.exam_id) then 1
      else null end
    where id = v_attempt.id returning * into v_attempt;
  end if;
  return v_attempt;
end;
$$;

revoke all on function public.start_topik_attempt(text) from public;
revoke all on function public.save_topik_answer(uuid, uuid, text) from public;
revoke all on function public.submit_topik_attempt(uuid) from public;
grant execute on function public.start_topik_attempt(text) to authenticated;
grant execute on function public.save_topik_answer(uuid, uuid, text) to authenticated;
grant execute on function public.submit_topik_attempt(uuid) to authenticated;

insert into public.topik_exams (id, exam_number, exam_title, form)
values ('35th', 35, 'The 35th Test of Proficiency in Korean I', 'B')
on conflict (id) do nothing;

insert into public.topik_variants (id, exam_id, mode, section, duration_seconds)
values
  ('35thmock', '35th', 'mock', null, 6000),
  ('35thlistening', '35th', 'listening', 'listening', null),
  ('35threading', '35th', 'reading', 'reading', null)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('topik-assets', 'topik-assets', true, 52428800, array['audio/mpeg', 'audio/mp3', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

drop policy if exists "Public can view TOPIK assets" on storage.objects;
create policy "Public can view TOPIK assets"
  on storage.objects for select to public using (bucket_id = 'topik-assets');


-- Seed the first complete paper. Later papers use the same exam/variant/question pattern.
with question_source(question_number, section, points, document_page, correct_option) as (
  values
    (1, 'listening', 4, 3, '3'),
    (2, 'listening', 4, 3, '2'),
    (3, 'listening', 3, 3, '1'),
    (4, 'listening', 3, 3, '2'),
    (5, 'listening', 4, 4, '1'),
    (6, 'listening', 3, 4, '2'),
    (7, 'listening', 3, 4, '2'),
    (8, 'listening', 3, 4, '4'),
    (9, 'listening', 3, 5, '3'),
    (10, 'listening', 4, 5, '4'),
    (11, 'listening', 3, 5, '1'),
    (12, 'listening', 3, 5, '4'),
    (13, 'listening', 4, 5, '3'),
    (14, 'listening', 3, 5, '4'),
    (15, 'listening', 4, 6, '1'),
    (16, 'listening', 4, 6, '3'),
    (17, 'listening', 3, 7, '3'),
    (18, 'listening', 3, 7, '4'),
    (19, 'listening', 3, 7, '3'),
    (20, 'listening', 3, 8, '2'),
    (21, 'listening', 3, 8, '2'),
    (22, 'listening', 3, 8, '2'),
    (23, 'listening', 3, 8, '1'),
    (24, 'listening', 3, 8, '1'),
    (25, 'listening', 3, 9, '4'),
    (26, 'listening', 4, 9, '4'),
    (27, 'listening', 3, 9, '1'),
    (28, 'listening', 4, 9, '3'),
    (29, 'listening', 3, 10, '1'),
    (30, 'listening', 4, 10, '2'),
    (31, 'reading', 2, 11, '3'),
    (32, 'reading', 2, 11, '4'),
    (33, 'reading', 2, 11, '1'),
    (34, 'reading', 2, 12, '4'),
    (35, 'reading', 2, 12, '1'),
    (36, 'reading', 2, 12, '3'),
    (37, 'reading', 3, 12, '3'),
    (38, 'reading', 3, 13, '1'),
    (39, 'reading', 2, 13, '1'),
    (40, 'reading', 3, 13, '3'),
    (41, 'reading', 3, 14, '2'),
    (42, 'reading', 3, 14, '4'),
    (43, 'reading', 3, 15, '1'),
    (44, 'reading', 2, 15, '2'),
    (45, 'reading', 3, 15, '2'),
    (46, 'reading', 3, 16, '4'),
    (47, 'reading', 3, 16, '3'),
    (48, 'reading', 2, 16, '3'),
    (49, 'reading', 3, 17, '2'),
    (50, 'reading', 2, 17, '4'),
    (51, 'reading', 3, 18, '1'),
    (52, 'reading', 2, 18, '2'),
    (53, 'reading', 2, 19, '4'),
    (54, 'reading', 3, 19, '3'),
    (55, 'reading', 2, 20, '3'),
    (56, 'reading', 3, 20, '2'),
    (57, 'reading', 2, 21, '4'),
    (58, 'reading', 3, 21, '2'),
    (59, 'reading', 2, 22, '2'),
    (60, 'reading', 3, 22, '3'),
    (61, 'reading', 2, 23, '1'),
    (62, 'reading', 2, 23, '1'),
    (63, 'reading', 2, 24, '4'),
    (64, 'reading', 3, 24, '4'),
    (65, 'reading', 2, 25, '2'),
    (66, 'reading', 3, 25, '3'),
    (67, 'reading', 3, 26, '1'),
    (68, 'reading', 3, 26, '3'),
    (69, 'reading', 3, 27, '4'),
    (70, 'reading', 3, 27, '1')
), question_upsert as (
  insert into public.topik_questions (exam_id, section, question_number, points, content)
  select '35th', section, question_number, points,
    jsonb_build_object(
      'document_page', document_page,
      'options', jsonb_build_array(
        jsonb_build_object('id', '1', 'text', ''),
        jsonb_build_object('id', '2', 'text', ''),
        jsonb_build_object('id', '3', 'text', ''),
        jsonb_build_object('id', '4', 'text', '')
      )
    )
  from question_source
  on conflict (exam_id, question_number) do update
    set section = excluded.section, points = excluded.points, content = excluded.content
  returning id, question_number
)
insert into public.topik_answer_keys (question_id, correct_option)
select q.id, s.correct_option
from question_upsert q
join question_source s using (question_number)
on conflict (question_id) do update set correct_option = excluded.correct_option;

-- The published 35th key's printed reading weights add to 101. Normalize that section
-- to TOPIK I's 100-point scale when calculating attempts (the per-question weights stay intact).
update public.topik_variants v
set content_ready = (
  (select count(*) from public.topik_questions q where q.exam_id = v.exam_id) = 70
  and (select count(*) from public.topik_answer_keys k join public.topik_questions q on q.id = k.question_id where q.exam_id = v.exam_id) = 70
)
where v.exam_id = '35th';
