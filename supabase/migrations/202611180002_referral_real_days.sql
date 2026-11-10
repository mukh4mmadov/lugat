-- Invited friends must really study before they earn the inviter Premium.
--
-- A friend used to count once their synced progress listed 3 study days, or
-- after any speaking session. Both were cheap for fake accounts: the device
-- writes the day list, and a few seconds of speech was enough. Now a friend
-- counts after activity on 3 different days that the server saw itself:
-- answers accepted by guard_progress, or a speaking session of a minute or
-- more (speaking time is measured on the server).

alter table public.progress_guard add column if not exists study_days date[] not null default '{}';

create or replace function public.guard_progress()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  c_xp_day constant integer := 3000;
  c_xp_rate constant numeric := 3;
  c_xp_burst constant integer := 300;
  c_answers_day constant integer := 600;
  c_answers_rate constant numeric := 0.5;
  c_answers_burst constant integer := 40;
  c_mastered_day constant integer := 80;
  c_first_streak constant integer := 3;
  v_today date := (now() at time zone 'Asia/Tashkent')::date;
  v_old jsonb := '{}'::jsonb;
  v_new jsonb := new.data;
  g progress_guard%rowtype;
  v_found boolean;
  v_elapsed numeric;
  v_trimmed text[] := '{}';
  v_old_xp numeric;
  v_new_xp numeric;
  v_allow numeric;
  v_add numeric;
  v_old_daily jsonb;
  v_daily jsonb := '{}'::jsonb;
  v_day text;
  v_count jsonb;
  v_n numeric;
  v_o numeric;
  v_d date;
  v_words jsonb;
  v_key text;
  v_word jsonb;
  v_old_known numeric;
  v_stats jsonb;
  v_os numeric;
  v_ns numeric;
  v_od date;
  v_nd date;
  v_studied boolean := false;
begin
  if coalesce(auth.role(), '') <> 'authenticated' or jsonb_typeof(new.data) is distinct from 'object' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    v_old := case when jsonb_typeof(old.data) = 'object' then old.data else '{}'::jsonb end;
  elsif exists (select 1 from user_progress where user_id = new.user_id) then
    -- An upsert onto an existing row: the UPDATE trigger checks it against
    -- the saved copy.
    return new;
  end if;

  select * into g from progress_guard where user_id = new.user_id for update;
  v_found := found;
  if not v_found then
    g.user_id := new.user_id;
    g.day := v_today;
    g.xp_today := 0;
    g.answers_today := 0;
    g.mastered_today := 0;
    g.xp_bucket := c_xp_burst;
    g.answers_bucket := c_answers_burst;
    g.last_at := now();
    g.trims := 0;
    g.study_days := '{}';
  end if;
  if g.day <> v_today then
    g.day := v_today;
    g.xp_today := 0;
    g.answers_today := 0;
    g.mastered_today := 0;
  end if;
  v_elapsed := greatest(0, extract(epoch from now() - g.last_at));
  g.xp_bucket := least(c_xp_burst, g.xp_bucket + v_elapsed * c_xp_rate);
  g.answers_bucket := least(c_answers_burst, g.answers_bucket + v_elapsed * c_answers_rate);
  g.last_at := now();

  -- XP
  v_old_xp := progress_number(v_old->'xp');
  v_new_xp := progress_number(v_new->'xp');
  if v_new_xp > v_old_xp then
    v_allow := greatest(0, floor(least(g.xp_bucket, c_xp_day - g.xp_today)));
    if v_new_xp - v_old_xp > v_allow then
      v_new_xp := v_old_xp + v_allow;
      v_trimmed := array_append(v_trimmed, 'xp');
    end if;
    g.xp_today := g.xp_today + (v_new_xp - v_old_xp);
    g.xp_bucket := g.xp_bucket - (v_new_xp - v_old_xp);
  end if;
  if v_new ? 'xp' or v_new_xp > 0 then
    v_new := jsonb_set(v_new, '{xp}', to_jsonb(v_new_xp));
  end if;

  v_stats := case when jsonb_typeof(v_new->'stats') = 'object' then v_new->'stats' else null end;

  -- Answers per day (the weekly leaderboard and daily goal)
  if v_stats is not null and jsonb_typeof(v_stats->'daily') = 'object' then
    v_old_daily := case when jsonb_typeof(v_old->'stats'->'daily') = 'object' then v_old->'stats'->'daily' else '{}'::jsonb end;
    for v_day, v_count in select key, value from jsonb_each(v_stats->'daily') order by key loop
      v_d := progress_date(v_day);
      if v_d is null then
        v_trimmed := array_append(v_trimmed, 'daily');
        continue;
      end if;
      v_n := floor(progress_number(v_count));
      v_o := floor(progress_number(v_old_daily->v_day));
      if v_n > v_o then
        if v_d between v_today - 1 and v_today + 1 then
          v_allow := greatest(0, floor(least(g.answers_bucket, c_answers_day - g.answers_today)));
          v_add := least(v_n - v_o, v_allow);
          g.answers_today := g.answers_today + v_add;
          g.answers_bucket := g.answers_bucket - v_add;
          v_studied := v_studied or v_add > 0;
        else
          v_add := 0;
        end if;
        if v_o + v_add < v_n then
          v_trimmed := array_append(v_trimmed, 'daily');
        end if;
        v_n := v_o + v_add;
      end if;
      if v_n > 0 then
        v_daily := v_daily || jsonb_build_object(v_day, v_n);
      end if;
    end loop;
    v_stats := jsonb_set(v_stats, '{daily}', v_daily);
  end if;

  -- Streak
  if v_stats is not null then
    v_os := floor(progress_number(v_old->'stats'->'streak'));
    v_ns := floor(progress_number(v_stats->'streak'));
    v_od := progress_date(v_old->'stats'->>'lastStudyDate');
    v_nd := progress_date(v_stats->>'lastStudyDate');
    if v_nd > v_today + 1 then
      v_nd := v_today;
      v_stats := jsonb_set(v_stats, '{lastStudyDate}', to_jsonb(v_nd::text));
      v_trimmed := array_append(v_trimmed, 'studyDate');
    end if;
    if v_ns > v_os then
      if tg_op = 'INSERT' then
        v_ns := least(v_ns, c_first_streak);
      elsif v_nd is null or v_nd < v_today - 1 or (v_od is not null and v_nd <= v_od) then
        v_ns := v_os;
      elsif v_od is not null and v_nd - v_od > 2 then
        v_ns := 1;
      else
        v_ns := least(v_ns, v_os + 1);
      end if;
      if v_ns < floor(progress_number(v_stats->'streak')) then
        v_trimmed := array_append(v_trimmed, 'streak');
      end if;
      v_stats := jsonb_set(v_stats, '{streak}', to_jsonb(v_ns));
    end if;
    v_new := jsonb_set(v_new, '{stats}', v_stats);
  end if;

  -- Mastered words (the all-time leaderboard)
  if jsonb_typeof(v_new->'words') = 'object' then
    v_words := v_new->'words';
    for v_key, v_word in select key, value from jsonb_each(v_new->'words') loop
      if progress_number(v_word->'knownCount') >= 3 then
        v_old_known := progress_number(v_old->'words'->v_key->'knownCount');
        if v_old_known < 3 then
          if g.mastered_today < c_mastered_day and jsonb_typeof(v_word) = 'object' then
            g.mastered_today := g.mastered_today + 1;
          else
            v_words := jsonb_set(v_words, array[v_key, 'knownCount'], to_jsonb(v_old_known));
            v_trimmed := array_append(v_trimmed, 'mastered');
          end if;
        end if;
      end if;
    end loop;
    v_new := jsonb_set(v_new, '{words}', v_words);
  end if;

  -- Days the server saw real answers: what an invited friend needs, since
  -- the device's own day list can be written in one go.
  if v_studied and not (v_today = any(g.study_days)) then
    g.study_days := g.study_days || v_today;
    g.study_days := g.study_days[greatest(1, cardinality(g.study_days) - 59):];
  end if;

  if array_length(v_trimmed, 1) > 0 then
    g.trims := g.trims + 1;
    g.last_trim := jsonb_build_object('at', now(), 'what', (select jsonb_agg(distinct t) from unnest(v_trimmed) t));
  end if;

  insert into progress_guard values (g.*)
  on conflict (user_id) do update set
    day = excluded.day,
    xp_today = excluded.xp_today,
    answers_today = excluded.answers_today,
    mastered_today = excluded.mastered_today,
    xp_bucket = excluded.xp_bucket,
    answers_bucket = excluded.answers_bucket,
    last_at = excluded.last_at,
    trims = excluded.trims,
    last_trim = excluded.last_trim,
    study_days = excluded.study_days;

  new.data := v_new;
  return new;
exception when others then
  -- A failed check never lets a save through unchecked: the saved copy is
  -- kept, and the device sends its progress again on its next save.
  raise warning 'guard_progress failed for %: %', new.user_id, sqlerrm;
  if tg_op = 'UPDATE' then
    new.data := old.data;
    return new;
  end if;
  return null;
end;
$$;

revoke all on function public.guard_progress() from public, anon, authenticated;

-- Server-seen days with real activity, Tashkent time.
create or replace function public.real_study_days(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(distinct d)::integer from (
    select unnest(study_days) as d from progress_guard where user_id = p_user
    union
    select (started_at at time zone 'Asia/Tashkent')::date from speaking_sessions
     where user_id = p_user and seconds >= 60 and started_at is not null
  ) days;
$$;

revoke all on function public.real_study_days(uuid) from public, anon, authenticated;

create or replace function public.my_referral(p_device text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_code text;
  v_ref referrals%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  select code into v_code from referral_codes where user_id = auth.uid();
  while v_code is null loop
    v_code := upper(substr(translate(md5(random()::text || clock_timestamp()::text), '01', ''), 1, 6));
    if length(v_code) = 6 and not exists (select 1 from referral_codes where code = v_code) then
      insert into referral_codes (user_id, code) values (auth.uid(), v_code);
    else
      v_code := null;
    end if;
  end loop;
  if p_device is not null and length(p_device) <= 80 then
    update referral_codes set devices = (select array_agg(distinct d) from unnest(devices || p_device) d)
     where user_id = auth.uid() and not (p_device = any(devices)) and cardinality(devices) < 20;
  end if;

  for v_ref in select * from referrals where referrer = auth.uid() and qualified_at is null and not revoked loop
    if exists (select 1 from auth.users u where u.id = v_ref.referred and u.email_confirmed_at is not null)
       and real_study_days(v_ref.referred) >= 3 then
      update referrals set qualified_at = now() where referred = v_ref.referred;
    end if;
  end loop;

  return jsonb_build_object(
    'code', v_code,
    'invited', (select count(*) from referrals where referrer = auth.uid() and not revoked),
    'qualified', (select count(*) from referrals where referrer = auth.uid() and qualified_at is not null and not revoked),
    'claimed', (select coalesce(jsonb_agg(days order by claimed_at), '[]'::jsonb) from reward_claims where user_id = auth.uid() and kind like 'invite%'));
end;
$$;
