-- Migration 00005: Create domains (life areas) and goals tables with composite FKs and RLS

-- 1. Create domains table
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  color text not null default '#5A4F7C',
  icon text not null default 'folder',
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint domains_workspace_id_id_key unique (workspace_id, id)
);

comment on table public.domains is 'Life areas/domains belonging to a workspace. Enforces unique name per workspace when unarchived.';

-- Unique name per workspace among non-archived domains
create unique index if not exists domains_workspace_name_unarchived_idx
  on public.domains (workspace_id, lower(name))
  where archived_at is null;

-- Trigger updated_at on domains
drop trigger if exists set_domains_updated_at on public.domains;
create trigger set_domains_updated_at
  before update on public.domains
  for each row
  execute function public.set_updated_at();

-- RLS on domains
alter table public.domains enable row level security;

create policy "domains_select"
  on public.domains
  for select
  to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "domains_insert"
  on public.domains
  for insert
  to authenticated
  with check (public.is_workspace_owner(workspace_id));

create policy "domains_update"
  on public.domains
  for update
  to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "domains_delete"
  on public.domains
  for delete
  to authenticated
  using (public.is_workspace_owner(workspace_id));

-- 2. Create goals table
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  domain_id uuid,
  title text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  start_date date,
  target_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_workspace_id_id_key unique (workspace_id, id),
  constraint goals_dates_order_check check (target_date is null or start_date is null or target_date >= start_date),
  constraint goals_domain_fk foreign key (workspace_id, domain_id)
    references public.domains (workspace_id, id) on delete set null
);

comment on table public.goals is 'High-level goals belonging to a workspace with optional life area domain.';

-- Trigger updated_at on goals
drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
  before update on public.goals
  for each row
  execute function public.set_updated_at();

-- RLS on goals
alter table public.goals enable row level security;

create policy "goals_select"
  on public.goals
  for select
  to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "goals_insert"
  on public.goals
  for insert
  to authenticated
  with check (public.is_workspace_owner(workspace_id));

create policy "goals_update"
  on public.goals
  for update
  to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "goals_delete"
  on public.goals
  for delete
  to authenticated
  using (public.is_workspace_owner(workspace_id));
