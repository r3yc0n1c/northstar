-- Migration 00005: Validate working_hours shape and ranges in SQL (FR-SET-3)
create or replace function public.validate_working_hours(wh jsonb)
returns boolean
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  day_key text;
  day_val jsonb;
  start_time text;
  end_time text;
  valid_days text[] := array['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
begin
  if jsonb_typeof(wh) != 'object' then
    return false;
  end if;

  for day_key, day_val in select * from jsonb_each(wh) loop
    if not (day_key = any(valid_days)) then
      return false;
    end if;

    if jsonb_typeof(day_val) != 'object' then
      return false;
    end if;

    start_time := day_val->>'start';
    end_time := day_val->>'end';

    if start_time is null or end_time is null then
      return false;
    end if;

    -- Validate HH:MM format
    if not (start_time ~ '^[0-2][0-9]:[0-5][0-9]$' and end_time ~ '^[0-2][0-9]:[0-5][0-9]$') then
      return false;
    end if;

    -- Validate end time is strictly after start time (reject invalid ranges inline)
    if end_time <= start_time then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

alter table public.profiles
  add constraint profiles_working_hours_valid
  check (public.validate_working_hours(working_hours));

comment on function public.validate_working_hours(jsonb) is 'Validates that working_hours is a valid JSON map of day keys to {start, end} objects with end > start.';

grant execute on function public.validate_working_hours(jsonb) to authenticated;
grant execute on function public.validate_working_hours(jsonb) to service_role;
