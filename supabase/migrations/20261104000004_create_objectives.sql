-- Migration 00007: Create objectives table with composite FKs to cycles and goals, and RLS

create table if not exists public.objectives (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  cycle_id uuid not null,
  goal_id uuid,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'achieved', 'abandoned')),
  priority text not null default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  confidence smallint check (confidence is null or (confidence >= 1 and confidence <= 10)),
  start_date date not null,
  due_date date not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint objectives_workspace_id_id_key unique (workspace_id, id),
  constraint objectives_dates_order_check check (due_date >= start_date),
  constraint objectives_cycle_fk foreign key (workspace_id, cycle_id)
    references public.cycles (workspace_id, id) on delete cascade,
  constraint objectives_goal_fk foreign key (workspace_id, goal_id)
    references public.goals (workspace_id, id) on delete set null
);

comment on table public.objectives is 'Objectives anchored to a cycle and optionally linked to a high-level goal.';

-- Indexes on objectives
create index if not exists objectives_workspace_cycle_idx
  on public.objectives (workspace_id, cycle_id);

create index if not exists objectives_workspace_goal_idx
  on public.objectives (workspace_id, goal_id);

-- Trigger updated_at on objectives
drop trigger if exists set_objectives_updated_at on public.objectives;
create trigger set_objectives_updated_at
  before update on public.objectives
  for each row
  execute function public.set_updated_at();

-- RLS on objectives
alter table public.objectives enable row level security;

create policy "objectives_select"
  on public.objectives
  for select
  to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "objectives_insert"
  on public.objectives
  for insert
  to authenticated
  with check (public.is_workspace_owner(workspace_id));

create policy "objectives_update"
  on public.objectives
  for update
  to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "objectives_delete"
  on public.objectives
  for delete
  to authenticated
  using (public.is_workspace_owner(workspace_id));
