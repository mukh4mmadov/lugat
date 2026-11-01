-- Live speaking calls between learners: a matching queue, the calls
-- themselves, ratings, blocks, reports and speaking bans. Learners only touch
-- these through the security-definer functions below; audio goes peer to peer
-- over WebRTC and is never recorded. Admins work through api/admin.js.
--
-- Age rule: under 14 cannot use live calls; 14–17 ("teen") and 18+ ("adult")
-- are only matched within their own group.

create table if not exists public.speaking_queue (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gender text not null check (gender in ('male', 'female')),
  want text not null default 'any' check (want in ('any', 'male', 'female')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  age_group text not null check (age_group in ('teen', 'adult')),
  topic_id text,
  -- Set when someone picks this learner; their next poll returns it.
  call_id uuid,
  seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_calls (
  id uuid primary key default gen_random_uuid(),
  -- The caller found the match and sends the WebRTC offer.
  caller uuid not null references auth.users(id) on delete cascade,
  callee uuid not null references auth.users(id) on delete cascade,
  topic_id text,
  level text,
  created_at timestamptz not null default now(),
  connected_at timestamptz,
  ended_at timestamptz,
  ended_by uuid,
  seconds integer not null default 0
);

create index if not exists speaking_calls_created_idx on public.speaking_calls (created_at desc);
create index if not exists speaking_calls_caller_idx on public.speaking_calls (caller, created_at desc);
create index if not exists speaking_calls_callee_idx on public.speaking_calls (callee, created_at desc);

create table if not exists public.speaking_ratings (
  call_id uuid not null references public.speaking_calls(id) on delete cascade,
  rater uuid not null references auth.users(id) on delete cascade,
  rated uuid not null references auth.users(id) on delete cascade,
  stars integer not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (call_id, rater)
);

create table if not exists public.speaking_blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);

create table if not exists public.speaking_reports (
  id bigint generated always as identity primary key,
  call_id uuid references public.speaking_calls(id) on delete set null,
  reporter uuid references auth.users(id) on delete set null,
  reported uuid references auth.users(id) on delete cascade,
  reason text not null check (reason in ('rude', 'sexual', 'spam', 'silent', 'underage', 'other')),
  note text not null default '' check (char_length(note) <= 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists speaking_reports_created_idx on public.speaking_reports (created_at desc);

create table if not exists public.speaking_bans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  until timestamptz not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table public.speaking_queue enable row level security;
alter table public.speaking_calls enable row level security;
alter table public.speaking_ratings enable row level security;
alter table public.speaking_blocks enable row level security;
alter table public.speaking_reports enable row level security;
alter table public.speaking_bans enable row level security;

drop policy if exists "Participants read their calls" on public.speaking_calls;
create policy "Participants read their calls"
  on public.speaking_calls for select to authenticated
  using (auth.uid() in (caller, callee));

drop policy if exists "Learners read their blocks" on public.speaking_blocks;
create policy "Learners read their blocks"
  on public.speaking_blocks for select to authenticated
  using (blocker = auth.uid());

drop policy if exists "Learners remove their blocks" on public.speaking_blocks;
create policy "Learners remove their blocks"
  on public.speaking_blocks for delete to authenticated
  using (blocker = auth.uid());

grant select on public.speaking_calls to authenticated;
grant select, delete on public.speaking_blocks to authenticated;
grant select, insert, update, delete on
  public.speaking_queue, public.speaking_calls, public.speaking_ratings,
  public.speaking_blocks, public.speaking_reports, public.speaking_bans
  to service_role;

insert into public.app_settings (key, value) values ('live_speaking_enabled', 'true'::jsonb)
on conflict (key) do nothing;

-- Whether a learner may join a live call now: null when they may, otherwise
-- the reason, which the app shows.
create or replace function public.speaking_live_block(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile record;
  v_age integer;
  v_until timestamptz;
  v_premium boolean;
  v_limit integer;
  v_used integer;
begin
  if exists (select 1 from app_settings where key in ('speaking_enabled', 'live_speaking_enabled') and value = 'false'::jsonb) then
    return jsonb_build_object('status', 'disabled');
  end if;
  select gender, korean_level, birth_year into v_profile from profiles where id = p_user;
  if v_profile.gender is null or v_profile.korean_level is null or v_profile.birth_year is null then
    return jsonb_build_object('status', 'need_profile');
  end if;
  v_age := extract(year from now())::integer - v_profile.birth_year;
  if v_age < 14 then
    return jsonb_build_object('status', 'too_young');
  end if;
  select until into v_until from speaking_bans where user_id = p_user and until > now();
  if v_until is not null then
    return jsonb_build_object('status', 'banned', 'until', v_until);
  end if;
  select coalesce((raw_app_meta_data->>'premium_until')::timestamptz > now(), false) into v_premium from auth.users where id = p_user;
  select coalesce((select value::text::integer from app_settings where key = case when v_premium then 'speaking_premium_seconds' else 'speaking_free_seconds' end),
                  case when v_premium then 7200 else 600 end) into v_limit;
  select coalesce(seconds, 0) into v_used from speaking_usage where user_id = p_user and day = (now() at time zone 'Asia/Tashkent')::date;
  if coalesce(v_used, 0) >= v_limit then
    return jsonb_build_object('status', 'limit', 'premium', v_premium);
  end if;
  return null;
end;
$$;

revoke all on function public.speaking_live_block(uuid) from public, anon, authenticated;

-- Ends a call once: counts the connected time for both learners against the
-- shared daily allowance and adds the call to both histories.
create or replace function public.finish_speaking_call(p_call uuid, p_by uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_call speaking_calls%rowtype;
  v_seconds integer;
  v_day date := (now() at time zone 'Asia/Tashkent')::date;
  v_user uuid;
begin
  update speaking_calls
     set ended_at = now(),
         ended_by = p_by,
         seconds = case when connected_at is null then 0
                        else least(extract(epoch from now() - connected_at)::integer, 3600) end
   where id = p_call and ended_at is null
   returning * into v_call;
  if not found then
    select seconds into v_seconds from speaking_calls where id = p_call;
    return coalesce(v_seconds, 0);
  end if;
  if v_call.seconds > 0 then
    foreach v_user in array array[v_call.caller, v_call.callee] loop
      insert into speaking_usage as u (user_id, day, seconds, turns)
      values (v_user, v_day, v_call.seconds, 1)
      on conflict (user_id, day) do update set seconds = u.seconds + excluded.seconds, turns = u.turns + 1;
      insert into speaking_sessions (user_id, kind, partner_id, topic_id, level, started_at, ended_at, seconds, turns)
      values (v_user, 'peer', case when v_user = v_call.caller then v_call.callee else v_call.caller end,
              v_call.topic_id, v_call.level, v_call.connected_at, v_call.ended_at, v_call.seconds, 1);
    end loop;
  end if;
  return v_call.seconds;
end;
$$;

revoke all on function public.finish_speaking_call(uuid, uuid) from public, anon, authenticated;
grant execute on function public.finish_speaking_call(uuid, uuid) to service_role;

-- Polled every few seconds while a learner looks for a partner. Returns
-- {status: matched, call_id, role} once paired, {status: waiting} meanwhile,
-- or the reason they can't join.
create or replace function public.find_speaking_partner(p_want text, p_level text, p_topic text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_block jsonb;
  v_call uuid;
  v_gender text;
  v_group text;
  v_partner uuid;
  v_open uuid;
begin
  if v_user is null then
    raise exception 'Not signed in';
  end if;
  if p_want not in ('any', 'male', 'female') or p_level not in ('beginner', 'intermediate', 'advanced') then
    raise exception 'Invalid filters';
  end if;

  -- Someone already picked us.
  select call_id into v_call from speaking_queue where user_id = v_user;
  if v_call is not null then
    delete from speaking_queue where user_id = v_user;
    if exists (select 1 from speaking_calls where id = v_call and ended_at is null) then
      return jsonb_build_object('status', 'matched', 'call_id', v_call, 'role', 'callee');
    end if;
  end if;

  v_block := speaking_live_block(v_user);
  if v_block is not null then
    delete from speaking_queue where user_id = v_user;
    return v_block;
  end if;

  -- Close calls this learner left without hanging up.
  for v_open in select id from speaking_calls where ended_at is null and v_user in (caller, callee) loop
    perform finish_speaking_call(v_open, v_user);
  end loop;

  select p.gender, case when extract(year from now())::integer - p.birth_year < 18 then 'teen' else 'adult' end
    into v_gender, v_group
    from profiles p where p.id = v_user;

  -- Learners who stopped polling; a picked one gets two minutes to notice.
  delete from speaking_queue
   where seen_at < now() - interval '15 seconds'
     and (call_id is null or seen_at < now() - interval '2 minutes');

  select q.user_id into v_partner
    from speaking_queue q
   where q.user_id <> v_user
     and q.call_id is null
     and q.age_group = v_group
     and q.level = p_level
     and (p_want = 'any' or q.gender = p_want)
     and (q.want = 'any' or q.want = v_gender)
     and not exists (
       select 1 from speaking_blocks b
        where (b.blocker = v_user and b.blocked = q.user_id) or (b.blocker = q.user_id and b.blocked = v_user))
   order by q.created_at
   limit 1
   for update skip locked;

  if v_partner is not null then
    insert into speaking_calls (caller, callee, topic_id, level)
    values (v_user, v_partner, p_topic, p_level)
    returning id into v_call;
    update speaking_queue set call_id = v_call where user_id = v_partner;
    delete from speaking_queue where user_id = v_user;
    return jsonb_build_object('status', 'matched', 'call_id', v_call, 'role', 'caller');
  end if;

  insert into speaking_queue (user_id, gender, want, level, age_group, topic_id)
  values (v_user, v_gender, p_want, p_level, v_group, p_topic)
  on conflict (user_id) do update
    set gender = excluded.gender, want = excluded.want, level = excluded.level,
        age_group = excluded.age_group, topic_id = excluded.topic_id, seen_at = now(), call_id = null;
  return jsonb_build_object('status', 'waiting',
    'waiting', (select count(*) from speaking_queue where call_id is null and seen_at > now() - interval '15 seconds'));
end;
$$;

-- Stops looking for a partner.
create or replace function public.leave_speaking_queue()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.speaking_queue where user_id = auth.uid() and call_id is null;
$$;

-- The other learner in a call: first name, gender and level only.
create or replace function public.speaking_call_info(p_call uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_call speaking_calls%rowtype;
  v_partner uuid;
  v_profile record;
begin
  select * into v_call from speaking_calls where id = p_call and auth.uid() in (caller, callee);
  if not found then
    return null;
  end if;
  v_partner := case when v_call.caller = auth.uid() then v_call.callee else v_call.caller end;
  select first_name, gender, korean_level into v_profile from profiles where id = v_partner;
  return jsonb_build_object(
    'call_id', v_call.id,
    'role', case when v_call.caller = auth.uid() then 'caller' else 'callee' end,
    'partner_id', v_partner,
    'name', coalesce(nullif(v_profile.first_name, ''), '—'),
    'gender', v_profile.gender,
    'level', coalesce(v_call.level, v_profile.korean_level),
    'topic_id', v_call.topic_id,
    'connected_at', v_call.connected_at,
    'ended_at', v_call.ended_at);
end;
$$;

-- Marks the moment audio first connected; the time counts from here.
create or replace function public.mark_speaking_connected(p_call uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.speaking_calls set connected_at = coalesce(connected_at, now())
   where id = p_call and ended_at is null and auth.uid() in (caller, callee);
$$;

-- Hangs up; returns the call length in seconds.
create or replace function public.end_speaking_call(p_call uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from speaking_calls where id = p_call and auth.uid() in (caller, callee)) then
    raise exception 'Call not found';
  end if;
  return finish_speaking_call(p_call, auth.uid());
end;
$$;

create or replace function public.rate_speaking_call(p_call uuid, p_stars integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_call speaking_calls%rowtype;
begin
  select * into v_call from speaking_calls where id = p_call and auth.uid() in (caller, callee);
  if not found or p_stars not between 1 and 5 then
    raise exception 'Invalid rating';
  end if;
  insert into speaking_ratings (call_id, rater, rated, stars)
  values (p_call, auth.uid(), case when v_call.caller = auth.uid() then v_call.callee else v_call.caller end, p_stars)
  on conflict (call_id, rater) do update set stars = excluded.stars;
end;
$$;

create or replace function public.block_speaking_user(p_user uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.speaking_blocks (blocker, blocked)
  select auth.uid(), p_user where p_user <> auth.uid()
  on conflict do nothing;
$$;

-- Reports the other learner in a call and blocks them. Three open reports
-- from different learners within a week ban live calls for 24 hours.
create or replace function public.report_speaking_user(p_call uuid, p_reason text, p_note text default '')
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_call speaking_calls%rowtype;
  v_reported uuid;
begin
  select * into v_call from speaking_calls where id = p_call and auth.uid() in (caller, callee);
  if not found then
    raise exception 'Call not found';
  end if;
  v_reported := case when v_call.caller = auth.uid() then v_call.callee else v_call.caller end;
  if exists (select 1 from speaking_reports where call_id = p_call and reporter = auth.uid()) then
    return;
  end if;
  insert into speaking_reports (call_id, reporter, reported, reason, note)
  values (p_call, auth.uid(), v_reported, p_reason, left(coalesce(p_note, ''), 500));
  perform block_speaking_user(v_reported);
  if (select count(distinct reporter) from speaking_reports
       where reported = v_reported and status = 'open' and created_at > now() - interval '7 days') >= 3 then
    insert into speaking_bans (user_id, until, reason)
    values (v_reported, now() + interval '24 hours', 'auto: 3 reports')
    on conflict (user_id) do update set until = greatest(speaking_bans.until, excluded.until), reason = excluded.reason;
  end if;
end;
$$;

-- How many learners are looking for a partner or talking right now.
create or replace function public.speaking_online()
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (select count(*) from public.speaking_queue where seen_at > now() - interval '15 seconds')::integer
       + 2 * (select count(*) from public.speaking_calls
               where ended_at is null and connected_at > now() - interval '1 hour')::integer;
$$;

-- Whether this learner can use live calls, for the start screen.
create or replace function public.speaking_live_status()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.speaking_live_block(auth.uid()), jsonb_build_object('status', 'ok'));
$$;

revoke all on function public.find_speaking_partner(text, text, text) from public, anon;
revoke all on function public.leave_speaking_queue() from public, anon;
revoke all on function public.speaking_call_info(uuid) from public, anon;
revoke all on function public.mark_speaking_connected(uuid) from public, anon;
revoke all on function public.end_speaking_call(uuid) from public, anon;
revoke all on function public.rate_speaking_call(uuid, integer) from public, anon;
revoke all on function public.block_speaking_user(uuid) from public, anon;
revoke all on function public.report_speaking_user(uuid, text, text) from public, anon;
revoke all on function public.speaking_online() from public, anon;
revoke all on function public.speaking_live_status() from public, anon;
grant execute on function
  public.find_speaking_partner(text, text, text), public.leave_speaking_queue(),
  public.speaking_call_info(uuid), public.mark_speaking_connected(uuid),
  public.end_speaking_call(uuid), public.rate_speaking_call(uuid, integer),
  public.block_speaking_user(uuid), public.report_speaking_user(uuid, text, text),
  public.speaking_online(), public.speaking_live_status()
  to authenticated;
