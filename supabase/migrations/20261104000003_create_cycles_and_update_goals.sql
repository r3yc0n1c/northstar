-- Migration 00006: Create cycles table and update goals priority constraint

-- 1. Create cycles table
create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  cycle_type text not null check (cycle_type in ('monthly', 'quarterly', 'annual', 'custom')),
  start_date date not null,
  end_date date not null,
  status text not null default 'planned' check (status in ('planned', 'active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cycles_workspace_id_id_key unique (workspace_id, id),
  constraint cycles_dates_order_check check (end_date >= start_date)
);

comment on table public.cycles is 'Time-bound planning cycles (monthly, quarterly, annual, custom) belonging to a workspace.';

-- Indexes on cycles
create index if not exists cycles_workspace_status_idx
  on public.cycles (workspace_id, status);

create index if not exists cycles_workspace_dates_idx
  on public.cycles (workspace_id, start_date, end_date);

-- Trigger updated_at on cycles
drop trigger if exists set_cycles_updated_at on public.cycles;
create trigger set_cycles_updated_at
  before update on public.cycles
  for each row
  execute function public.set_updated_at();

-- RLS on cycles
alter table public.cycles enable row level security;

create policy "cycles_select"
  on public.cycles
  for select
  to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "cycles_insert"
  on public.cycles
  for insert
  to authenticated
  with check (public.is_workspace_owner(workspace_id));

create policy "cycles_update"
  on public.cycles
  for update
  to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "cycles_delete"
  on public.cycles
  for delete
  to authenticated
  using (public.is_workspace_owner(workspace_id));

-- 2. Update goals table priority check constraint to include 'none'
alter table public.goals drop constraint if exists goals_priority_check;
alter table public.goals add constraint goals_priority_check
  check (priority in ('none', 'low', 'medium', 'high', 'urgent'));
alter table public.goals alter column priority set default 'none';
