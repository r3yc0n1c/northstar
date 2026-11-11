-- Migration: create key_results table and kr_progress immutable function
-- Enforces composite foreign keys (workspace_id, objective_id)
-- Enforces numeric and binary check constraints
-- Implements single single-source-of-truth progress calculation

-- 1. Create key_results table
create table public.key_results (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  objective_id uuid not null,
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  description text default '',
  metric_type text not null check (metric_type in ('numeric', 'binary')),
  baseline_value numeric not null,
  current_value numeric not null,
  target_value numeric not null,
  unit text not null default '',
  currency_code text check (currency_code is null or char_length(currency_code) = 3),
  direction text check (direction in ('increase', 'decrease')),
  confidence smallint check (confidence is null or (confidence >= 1 and confidence <= 10)),
  start_date date not null,
  due_date date not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Unique constraint for composite foreign keys from child tables (e.g. kr_check_ins, tasks)
  constraint uq_key_results_workspace_id unique (workspace_id, id),

  -- Composite foreign key to objectives table
  constraint fk_key_results_objective_workspace
    foreign key (workspace_id, objective_id)
    references public.objectives(workspace_id, id)
    on delete cascade,

  -- Date ordering check
  constraint key_results_dates_order_check check (due_date >= start_date),

  -- Metric type rules: numeric
  constraint key_results_numeric_metric_check check (
    metric_type != 'numeric' or (
      direction is not null
      and target_value <> baseline_value
      and (
        (direction = 'increase' and target_value > baseline_value) or
        (direction = 'decrease' and target_value < baseline_value)
      )
    )
  ),

  -- Metric type rules: binary
  constraint key_results_binary_metric_check check (
    metric_type != 'binary' or (
      direction is null
      and baseline_value = 0
      and target_value = 1
      and current_value in (0, 1)
    )
  )
);

-- 2. Indexes
create index idx_key_results_workspace_objective on public.key_results (workspace_id, objective_id);
create index idx_key_results_workspace_archived on public.key_results (workspace_id, archived_at);

-- 3. Trigger for updated_at
create trigger set_key_results_updated_at
  before update on public.key_results
  for each row
  execute function public.set_updated_at();

-- 4. Enable Row Level Security
alter table public.key_results enable row level security;

-- 5. Explicit RLS Policies using is_workspace_owner helper
create policy "key_results_select_workspace_owner"
  on public.key_results
  for select
  to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "key_results_insert_workspace_owner"
  on public.key_results
  for insert
  to authenticated
  with check (public.is_workspace_owner(workspace_id));

create policy "key_results_update_workspace_owner"
  on public.key_results
  for update
  to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "key_results_delete_workspace_owner"
  on public.key_results
  for delete
  to authenticated
  using (public.is_workspace_owner(workspace_id));

-- 6. kr_progress immutable function
create or replace function public.kr_progress(
  baseline numeric,
  current numeric,
  target numeric,
  direction text,
  metric_type text
)
returns numeric
language plpgsql
immutable
as $$
begin
  if metric_type = 'binary' then
    if current >= 1 then
      return 100;
    else
      return 0;
    end if;
  elsif metric_type = 'numeric' then
    if target = baseline then
      raise exception 'Target value cannot equal baseline value for numeric metric';
    end if;

    if direction = 'increase' then
      return ((current - baseline) / (target - baseline)) * 100;
    elsif direction = 'decrease' then
      return ((baseline - current) / (baseline - target)) * 100;
    else
      raise exception 'Invalid direction for numeric key result: %', direction;
    end if;
  else
    raise exception 'Invalid metric type: %', metric_type;
  end if;
end;
$$;

grant execute on function public.kr_progress(numeric, numeric, numeric, text, text) to authenticated, anon;
