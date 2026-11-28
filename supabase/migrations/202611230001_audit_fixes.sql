create or replace function public.progress_types()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v jsonb := new.data;
  v_key text;
  v_word jsonb;
begin
  if coalesce(auth.role(), '') <> 'authenticated' or jsonb_typeof(v) is distinct from 'object' then
    return new;
  end if;
  if v ? 'xp' and jsonb_typeof(v->'xp') <> 'number' then
    v := jsonb_set(v, '{xp}', '0');
  end if;
  if jsonb_typeof(v->'stats') = 'object' and (v->'stats') ? 'streak' and jsonb_typeof(v->'stats'->'streak') <> 'number' then
    v := jsonb_set(v, '{stats,streak}', '0');
  end if;
  if jsonb_typeof(v->'words') = 'object' then
    for v_key, v_word in select key, value from jsonb_each(v->'words') loop
      if jsonb_typeof(v_word) = 'object' and v_word ? 'knownCount' and jsonb_typeof(v_word->'knownCount') <> 'number' then
        v := jsonb_set(v, array['words', v_key, 'knownCount'], '0');
      end if;
    end loop;
  end if;
  new.data := v;
  return new;
end;
$$;

revoke all on function public.progress_types() from public, anon, authenticated;

drop trigger if exists user_progress_0_types on public.user_progress;
create trigger user_progress_0_types
  before insert or update of data on public.user_progress
  for each row execute function public.progress_types();

create or replace function public.leaderboard_row(p_user uuid, p_data jsonb)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into leaderboard_stats (user_id, words_mastered, streak, last_study_date, daily, hidden, updated_at)
  values (
    p_user,
    (select count(*) from jsonb_each(case when jsonb_typeof(p_data->'words') = 'object' then p_data->'words' else '{}'::jsonb end) w
      where jsonb_typeof(w.value) = 'object' and progress_number(w.value->'knownCount') >= 3),
    least(floor(progress_number(p_data->'stats'->'streak')), 100000)::integer,
    case when jsonb_typeof(p_data->'stats'->'lastStudyDate') = 'string' then left(p_data->'stats'->>'lastStudyDate', 10) else '' end,
    case when jsonb_typeof(p_data->'stats'->'daily') = 'object' then p_data->'stats'->'daily' else '{}'::jsonb end,
    coalesce(p_data->'settings'->'hideFromLeaderboard' = 'true'::jsonb, false),
    now())
  on conflict (user_id) do update set
    words_mastered = excluded.words_mastered,
    streak = excluded.streak,
    last_study_date = excluded.last_study_date,
    daily = excluded.daily,
    hidden = excluded.hidden,
    updated_at = now();
$$;

revoke all on function public.leaderboard_row(uuid, jsonb) from public, anon, authenticated;

create or replace function public.track_league_xp()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_week date := league_week();
  v_new integer := least(floor(progress_number(new.data->'xp')), 2000000000)::integer;
  v_old integer := case when tg_op = 'UPDATE' then least(floor(progress_number(old.data->'xp')), 2000000000)::integer else v_new end;
  v_league integer;
  v_group integer;
begin
  update league_members set xp_now = greatest(xp_now, v_new)
   where week = v_week and user_id = new.user_id;
  if found or v_new <= v_old then
    return new;
  end if;
  v_league := next_league(new.user_id, v_week);
  perform pg_advisory_xact_lock(hashtext('league:' || v_week || ':' || v_league));
  select g.group_no into v_group from (
    select group_no, count(*) as size from league_members
     where week = v_week and league = v_league group by group_no
  ) g where g.size < 30 order by g.group_no limit 1;
  if v_group is null then
    select coalesce(max(group_no), 0) + 1 into v_group from league_members where week = v_week and league = v_league;
  end if;
  insert into league_members (week, user_id, league, group_no, xp_start, xp_now)
  values (v_week, new.user_id, v_league, v_group, v_old, v_new)
  on conflict (week, user_id) do update set xp_now = greatest(league_members.xp_now, excluded.xp_now);
  return new;
exception when others then
  return new;
end;
$$;

revoke all on function public.track_league_xp() from public, anon, authenticated;

update public.user_progress set data = jsonb_set(data, '{stats,streak}', '0')
 where jsonb_typeof(data->'stats') = 'object' and (data->'stats') ? 'streak' and jsonb_typeof(data->'stats'->'streak') <> 'number';
update public.user_progress p set data = jsonb_set(p.data, '{words}', (
    select jsonb_object_agg(w.key, case when jsonb_typeof(w.value) = 'object' and w.value ? 'knownCount' and jsonb_typeof(w.value->'knownCount') <> 'number'
                                        then jsonb_set(w.value, '{knownCount}', '0') else w.value end)
      from jsonb_each(p.data->'words') w))
 where jsonb_typeof(p.data->'words') = 'object'
   and exists (select 1 from jsonb_each(p.data->'words') w
                where jsonb_typeof(w.value) = 'object' and w.value ? 'knownCount' and jsonb_typeof(w.value->'knownCount') <> 'number');
select public.leaderboard_row(user_id, data) from public.user_progress;

create or replace function public.guard_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
  else
    new.created_at := now();
  end if;
  if new.first_name is not null then
    new.first_name := left(trim(regexp_replace(new.first_name, '[[:cntrl:]]', '', 'g')), 40);
  end if;
  if new.last_name is not null then
    new.last_name := left(trim(regexp_replace(new.last_name, '[[:cntrl:]]', '', 'g')), 40);
  end if;
  return new;
end;
$$;

revoke all on function public.guard_profile() from public, anon, authenticated;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before insert or update on public.profiles
  for each row execute function public.guard_profile();

create or replace function public.limit_app_errors()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;
  if (select count(*) from app_errors where created_at > now() - interval '1 minute') >= 60
     or (select count(*) from app_errors where created_at > now() - interval '1 day') >= 3000 then
    return null;
  end if;
  return new;
end;
$$;

revoke all on function public.limit_app_errors() from public, anon, authenticated;

drop trigger if exists app_errors_limit on public.app_errors;
create trigger app_errors_limit
  before insert on public.app_errors
  for each row execute function public.limit_app_errors();
