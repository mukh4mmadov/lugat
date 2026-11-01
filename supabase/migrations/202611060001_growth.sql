-- Growth: weekly leagues, invites and push reminders.
--
-- Leagues: a learner joins this week's league the first time their synced
-- XP grows in the week (a trigger on user_progress). Groups hold up to 30
-- learners of the same league; the week starts on Monday, Tashkent time. When
-- a learner joins a new week, last week's rank decides the league: top 5
-- (with XP) move up, bottom 5 move down. No cron needed.
--
-- Invites: every learner has a short code; a new account opened with
-- ?ref=CODE is linked to the inviter. It counts once the friend has a
-- confirmed email, a different device, and a speaking session or 3 study
-- days. api/rewards.js gives the Premium days.
--
-- Push: browsers that opted in, used by api/push.js and api/cron-reminders.js.

create table if not exists public.league_members (
  week date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  league integer not null default 1 check (league between 1 and 5),
  group_no integer not null,
  xp_start integer not null default 0,
  xp_now integer not null default 0,
  excluded boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (week, user_id)
);

create index if not exists league_members_group_idx on public.league_members (week, league, group_no);

alter table public.league_members enable row level security;
grant select, insert, update, delete on public.league_members to service_role;

create or replace function public.league_week(p_at timestamptz default now())
returns date
language sql
stable
as $$
  select date_trunc('week', p_at at time zone 'Asia/Tashkent')::date;
$$;

-- League for a learner's new week, from their place last week.
create or replace function public.next_league(p_user uuid, p_week date)
returns integer
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_last league_members%rowtype;
  v_rank integer;
  v_size integer;
begin
  select * into v_last from league_members
   where user_id = p_user and week < p_week
   order by week desc limit 1;
  if not found then
    return 1;
  end if;
  -- Missed weeks in between: stay where they were.
  if v_last.week < p_week - 7 then
    return v_last.league;
  end if;
  select count(*) + 1 into v_rank from league_members m
   where m.week = v_last.week and m.league = v_last.league and m.group_no = v_last.group_no and not m.excluded
     and (m.xp_now - m.xp_start) > (v_last.xp_now - v_last.xp_start);
  select count(*) into v_size from league_members m
   where m.week = v_last.week and m.league = v_last.league and m.group_no = v_last.group_no and not m.excluded;
  if v_rank <= 5 and v_last.xp_now > v_last.xp_start and not v_last.excluded then
    return least(v_last.league + 1, 5);
  end if;
  if v_size >= 10 and v_rank > v_size - 5 then
    return greatest(v_last.league - 1, 1);
  end if;
  return v_last.league;
end;
$$;

-- Keeps this week's league XP in step with the synced progress.
create or replace function public.track_league_xp()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_week date := league_week();
  v_new integer := coalesce((new.data->>'xp')::integer, 0);
  v_old integer := case when tg_op = 'UPDATE' then coalesce((old.data->>'xp')::integer, 0) else v_new end;
  v_league integer;
  v_group integer;
begin
  update league_members set xp_now = greatest(xp_now, v_new)
   where week = v_week and user_id = new.user_id;
  if found or v_new <= v_old then
    return new;
  end if;
  v_league := next_league(new.user_id, v_week);
  -- Serialise group filling for this league and week.
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
  -- League bookkeeping must never block saving progress.
  return new;
end;
$$;

drop trigger if exists user_progress_league_xp on public.user_progress;
create trigger user_progress_league_xp
  after insert or update of data on public.user_progress
  for each row execute function public.track_league_xp();

-- The caller's league group this week: ranks, names and the week's end.
create or replace function public.my_league()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_week date := league_week();
  v_me league_members%rowtype;
begin
  select * into v_me from league_members where week = v_week and user_id = auth.uid();
  if not found then
    return jsonb_build_object('joined', false, 'league', next_league(auth.uid(), v_week),
      'ends_at', ((v_week + 7)::timestamp at time zone 'Asia/Tashkent'));
  end if;
  return jsonb_build_object(
    'joined', true,
    'league', v_me.league,
    'ends_at', ((v_week + 7)::timestamp at time zone 'Asia/Tashkent'),
    'members', (
      select coalesce(jsonb_agg(row_to_json(r) order by r.xp desc, r.joined_at), '[]'::jsonb) from (
        select m.user_id = auth.uid() as me,
               case when coalesce((p.data->'settings'->>'hideFromLeaderboard')::boolean, false) and m.user_id <> auth.uid()
                    then null
                    else nullif(trim(coalesce(pr.first_name, '') || ' ' || left(coalesce(pr.last_name, ''), 1)), '') end as name,
               m.xp_now - m.xp_start as xp,
               m.joined_at
          from league_members m
          left join profiles pr on pr.id = m.user_id
          left join user_progress p on p.user_id = m.user_id
         where m.week = v_week and m.league = v_me.league and m.group_no = v_me.group_no and not m.excluded
      ) r));
end;
$$;

revoke all on function public.next_league(uuid, date) from public, anon, authenticated;
revoke all on function public.track_league_xp() from public, anon, authenticated;
revoke all on function public.my_league() from public, anon;
grant execute on function public.my_league() to authenticated;

-- Invites.
create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  devices text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  referred uuid primary key references auth.users(id) on delete cascade,
  referrer uuid not null references auth.users(id) on delete cascade,
  device_id text,
  qualified_at timestamptz,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists referrals_referrer_idx on public.referrals (referrer);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
grant select, insert, update, delete on public.referral_codes, public.referrals to service_role;

-- The caller's invite code (made on first use) and their invited friends.
-- Also checks whether pending friends now count.
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
       and (exists (select 1 from speaking_sessions s where s.user_id = v_ref.referred and s.seconds > 0)
            or (select count(*) from user_progress p, jsonb_object_keys(coalesce(p.data->'stats'->'daily', '{}'::jsonb)) k
                 where p.user_id = v_ref.referred) >= 3) then
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

-- Links a new account to the friend who invited it. Returns ok, or why not.
create or replace function public.claim_referral(p_code text, p_device text default null)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_referrer uuid;
  v_devices text[];
begin
  if auth.uid() is null then
    return 'signed_out';
  end if;
  if exists (select 1 from referrals where referred = auth.uid()) then
    return 'already';
  end if;
  if (select created_at from auth.users where id = auth.uid()) < now() - interval '7 days' then
    return 'too_old';
  end if;
  select user_id, devices into v_referrer, v_devices from referral_codes where code = upper(trim(p_code));
  if v_referrer is null then
    return 'unknown';
  end if;
  if v_referrer = auth.uid() then
    return 'self';
  end if;
  if p_device is not null and p_device = any(v_devices) then
    return 'same_device';
  end if;
  if p_device is not null and exists (select 1 from referrals where referrer = v_referrer and device_id = p_device) then
    return 'same_device';
  end if;
  insert into referrals (referred, referrer, device_id) values (auth.uid(), v_referrer, p_device);
  return 'ok';
end;
$$;

revoke all on function public.my_referral(text) from public, anon;
revoke all on function public.claim_referral(text, text) from public, anon;
grant execute on function public.my_referral(text), public.claim_referral(text, text) to authenticated;

-- Push subscriptions and what was sent, for the daily cap.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  language text not null default 'uz',
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

create table if not exists public.push_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  sent_at timestamptz not null default now()
);

create index if not exists push_log_user_idx on public.push_log (user_id, sent_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.push_log enable row level security;
grant select, insert, update, delete on public.push_subscriptions, public.push_log to service_role;

-- Each invite tier can be claimed once, even by two requests at the same time.
create unique index if not exists reward_claims_invite_once
  on public.reward_claims (user_id, kind) where kind like 'invite%';
