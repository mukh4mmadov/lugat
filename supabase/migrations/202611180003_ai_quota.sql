create table if not exists public.ai_quota (
  key text not null,
  day date not null,
  count integer not null default 0,
  primary key (key, day)
);

alter table public.ai_quota enable row level security;
grant select, insert, update, delete on public.ai_quota to service_role;

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
