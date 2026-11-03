-- Migration 00004: Row Level Security for profiles and workspaces

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Enable RLS on workspaces
alter table public.workspaces enable row level security;

-- Policies for workspaces
create policy "workspaces_select_own"
on public.workspaces
for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "workspaces_update_own"
on public.workspaces
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
