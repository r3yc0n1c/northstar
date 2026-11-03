-- Migration 00003: Functions and triggers for provisioning and workspace ownership

-- 1. set_updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach updated_at trigger to profiles and workspaces
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

-- 2. handle_new_user trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
begin
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    'User'
  );

  -- 1. Insert profile
  insert into public.profiles (
    id,
    display_name,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    v_display_name,
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    now(),
    now()
  );

  -- 2. Insert workspace
  insert into public.workspaces (
    id,
    owner_id,
    name,
    vision,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    new.id,
    'Personal',
    '',
    now(),
    now()
  );

  return new;
end;
$$;

-- Revoke execute from public for handle_new_user
revoke all on function public.handle_new_user() from public;

-- Attach handle_new_user trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 3. is_workspace_owner helper function
create or replace function public.is_workspace_owner(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = ws
      and w.owner_id = (select auth.uid())
  );
$$;

-- Permissions for is_workspace_owner
revoke all on function public.is_workspace_owner(uuid) from public;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
