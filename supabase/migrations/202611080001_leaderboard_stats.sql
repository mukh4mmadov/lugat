-- Leaderboard without reading everyone's full progress: a small row per
-- learner kept up to date from user_progress by a trigger, and one function
-- that ranks them in the database. api/leaderboard.js calls get_leaderboard.

create table if not exists public.leaderboard_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  words_mastered integer not null default 0,
  streak integer not null default 0,
  last_study_date text not null default '',
  daily jsonb not null default '{}'::jsonb,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.leaderboard_stats enable row level security;
grant select, insert, update, delete on public.leaderboard_stats to service_role;

create or replace function public.leaderboard_row(p_user uuid, p_data jsonb)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into leaderboard_stats (user_id, words_mastered, streak, last_study_date, daily, hidden, updated_at)
  values (
    p_user,
    (select count(*) from jsonb_each(coalesce(p_data->'words', '{}'::jsonb)) w
      where coalesce((w.value->>'knownCount')::numeric, 0) >= 3),
    coalesce((p_data->'stats'->>'streak')::integer, 0),
    coalesce(p_data->'stats'->>'lastStudyDate', ''),
    coalesce(p_data->'stats'->'daily', '{}'::jsonb),
    coalesce((p_data->'settings'->>'hideFromLeaderboard')::boolean, false),
    now())
  on conflict (user_id) do update set
    words_mastered = excluded.words_mastered,
    streak = excluded.streak,
    last_study_date = excluded.last_study_date,
    daily = excluded.daily,
    hidden = excluded.hidden,
    updated_at = now();
$$;

create or replace function public.track_leaderboard_stats()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform leaderboard_row(new.user_id, new.data);
  return new;
exception when others then
  -- Leaderboard bookkeeping must never block saving progress.
  return new;
end;
$$;

drop trigger if exists user_progress_leaderboard on public.user_progress;
create trigger user_progress_leaderboard
  after insert or update of data on public.user_progress
  for each row execute function public.track_leaderboard_stats();

-- Fill it for everyone who already has progress.
select public.leaderboard_row(user_id, data) from public.user_progress;

-- Top 50 for the week (answers in the last 7 days, one spare day for time
-- zones), all time (words answered right 3+ times) and speaking minutes
-- (7 days), plus the viewer's own rank on each board.
create or replace function public.get_leaderboard(p_viewer uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_first_day text := to_char((now() at time zone 'Asia/Tashkent')::date - 8, 'YYYY-MM-DD');
  v_since_day date := (now() at time zone 'Asia/Tashkent')::date - 7;
  v_result jsonb := '{}'::jsonb;
  v_board text;
begin
  foreach v_board in array array['week', 'all', 'speaking'] loop
    v_result := v_result || jsonb_build_object(v_board, (
      with entries as (
        select s.user_id, s.streak,
               case when nullif(trim(p.last_name), '') is null then trim(p.first_name)
                    else trim(p.first_name) || ' ' || upper(left(trim(p.last_name), 1)) || '.' end as name,
               case v_board
                 when 'week' then coalesce((select sum((d.value)::text::numeric)::integer from jsonb_each(s.daily) d where d.key >= v_first_day), 0)
                 when 'all' then s.words_mastered
                 else coalesce((select floor(sum(u.seconds) / 60)::integer from speaking_usage u where u.user_id = s.user_id and u.day >= v_since_day), 0)
               end as score
          from leaderboard_stats s
          join profiles p on p.id = s.user_id
         where not s.hidden and nullif(trim(p.first_name), '') is not null
      ), ranked as (
        select *, row_number() over (order by score desc, streak desc, name) as rank
          from entries where score > 0
      )
      select jsonb_build_object(
        'rows', coalesce((select jsonb_agg(jsonb_build_object('rank', rank, 'name', name, 'score', score, 'streak', streak, 'me', user_id = p_viewer) order by rank)
                            from ranked where rank <= 50), '[]'::jsonb),
        'me', (select jsonb_build_object('rank', rank, 'score', score, 'of', (select count(*) from ranked)) from ranked where user_id = p_viewer),
        'total', (select count(*) from ranked))));
  end loop;
  return v_result;
end;
$$;

revoke all on function public.leaderboard_row(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.track_leaderboard_stats() from public, anon, authenticated;
revoke all on function public.get_leaderboard(uuid) from public, anon, authenticated;
grant execute on function public.get_leaderboard(uuid) to service_role;
