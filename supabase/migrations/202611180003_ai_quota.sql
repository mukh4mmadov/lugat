-- Daily AI allowances counted in the database.
--
-- Without Upstash Redis the AI endpoints counted questions in server memory,
-- which Vercel resets whenever it starts a new instance, so the daily limits
-- barely held and a learner could run up the AI bill. One row per key and
-- Tashkent day; only the service role (the API) can use it.

create table if not exists public.ai_quota (
  key text not null,
  day date not null,
  count integer not null default 0,
  primary key (key, day)
);

alter table public.ai_quota enable row level security;
grant select, insert, update, delete on public.ai_quota to service_role;

-- Takes one use from today's allowance. Returns today's count with this use,
-- or null when the allowance is used up.
create or replace function public.consume_ai_quota(p_key text, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_day date := (now() at time zone 'Asia/Tashkent')::date;
  v_count integer;
begin
  if p_limit is null or p_limit <= 0 then
    return null;
  end if;
  insert into ai_quota as q (key, day, count) values (left(p_key, 200), v_day, 1)
  on conflict (key, day) do update set count = q.count + 1 where q.count < p_limit
  returning q.count into v_count;
  if random() < 0.01 then
    delete from ai_quota where day < v_day - 7;
  end if;
  return v_count;
end;
$$;

revoke all on function public.consume_ai_quota(text, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(text, integer) to service_role;
