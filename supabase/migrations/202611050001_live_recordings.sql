-- Live calls: no age limit or age groups any more (the owner's decision; easy
-- to bring back in speaking_live_block and find_speaking_partner), and calls
-- are recorded. Each side uploads a mix of both voices to the private
-- call-recordings bucket as <call id>/<user id>.<ext>; admins listen through
-- api/admin.js with signed URLs, and recordings are deleted after 30 days.
-- Learners are told in the terms, the privacy policy and on the call screen.

alter table public.speaking_calls
  add column if not exists recordings_deleted boolean not null default false;

create or replace function public.speaking_live_block(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile record;
  v_until timestamptz;
  v_premium boolean;
  v_limit integer;
  v_used integer;
begin
  if exists (select 1 from app_settings where key in ('speaking_enabled', 'live_speaking_enabled') and value = 'false'::jsonb) then
    return jsonb_build_object('status', 'disabled');
  end if;
  select gender, korean_level into v_profile from profiles where id = p_user;
  if v_profile.gender is null or v_profile.korean_level is null then
    return jsonb_build_object('status', 'need_profile');
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

  -- The age group is still stored for the admin view, but not matched on.
  select p.gender,
         case when p.birth_year is not null and extract(year from now())::integer - p.birth_year < 18 then 'teen' else 'adult' end
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

-- Private bucket for call recordings, up to 50 MB per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('call-recordings', 'call-recordings', false, 52428800, array['audio/webm', 'audio/ogg', 'audio/mp4'])
on conflict (id) do nothing;

-- A participant may upload one file, named after themselves, into the folder
-- of their own call. Nobody but the service role can read the files.
drop policy if exists "Participants upload their call recording" on storage.objects;
create policy "Participants upload their call recording"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'call-recordings'
    and split_part(name, '/', 2) like auth.uid()::text || '.%'
    and exists (
      select 1 from public.speaking_calls c
       where c.id::text = split_part(name, '/', 1)
         and auth.uid() in (c.caller, c.callee)
         and c.created_at > now() - interval '3 hours')
  );
