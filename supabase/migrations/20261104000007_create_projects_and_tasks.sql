-- Migration 20261104000007: Create projects, milestones, tasks, labels, and task relationship tables.
-- Implements PRD §5.6, §5.7, §9.3, §10:
-- - projects, project_milestones, project_objectives, project_key_results
-- - tasks, labels, task_labels
-- - triggers: completed_at transition, version increment, 1-level subtask constraint
-- - composite FK workspace isolation
-- - RLS policies for workspace owners

-- ==========================================
-- 1. PROJECTS TABLE
-- ==========================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  domain_id uuid,
  title text not null,
  description text not null default '',
  status text not null default 'planned' check (status in ('planned', 'active', 'on_hold', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  start_date date,
  due_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_dates_order_check check (due_date is null or start_date is null or due_date >= start_date),
  constraint projects_workspace_id_id_key unique (workspace_id, id),
  constraint projects_domain_fk foreign key (workspace_id, domain_id) references public.domains(workspace_id, id) on delete set null
);

create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- ==========================================
-- 2. PROJECT OBJECTIVES JUNCTION TABLE
-- ==========================================
create table if not exists public.project_objectives (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null,
  objective_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (project_id, objective_id),
  constraint project_objectives_project_fk foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete cascade,
  constraint project_objectives_objective_fk foreign key (workspace_id, objective_id) references public.objectives(workspace_id, id) on delete cascade
);

-- ==========================================
-- 3. PROJECT KEY RESULTS JUNCTION TABLE
-- ==========================================
create table if not exists public.project_key_results (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null,
  key_result_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (project_id, key_result_id),
  constraint project_key_results_project_fk foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete cascade,
  constraint project_key_results_kr_fk foreign key (workspace_id, key_result_id) references public.key_results(workspace_id, id) on delete cascade
);

-- ==========================================
-- 4. PROJECT MILESTONES TABLE
-- ==========================================
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null,
  title text not null,
  status text not null default 'open' check (status in ('open', 'done')),
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_milestones_workspace_id_id_key unique (workspace_id, id),
  constraint project_milestones_project_fk foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete cascade
);

create trigger update_project_milestones_updated_at
  before update on public.project_milestones
  for each row
  execute function public.set_updated_at();

-- Trigger for milestone completion timestamp
create or replace function public.handle_milestone_status_completed_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'done' then
    if TG_OP = 'INSERT' or old.status <> 'done' then
      new.completed_at := coalesce(new.completed_at, now());
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger project_milestones_completed_at_trigger
  before insert or update on public.project_milestones
  for each row
  execute function public.handle_milestone_status_completed_at();

-- ==========================================
-- 5. LABELS TABLE
-- ==========================================
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#5A4F7C',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint labels_workspace_id_id_key unique (workspace_id, id)
);

create unique index if not exists labels_workspace_lower_name_idx
  on public.labels (workspace_id, lower(name));

create trigger update_labels_updated_at
  before update on public.labels
  for each row
  execute function public.set_updated_at();

-- ==========================================
-- 6. TASKS TABLE
-- ==========================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid,
  key_result_id uuid,
  parent_task_id uuid,
  title text not null,
  description text not null default '',
  status text not null default 'inbox' check (status in ('inbox', 'todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority text not null default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  planned_date date,
  planned_start_at time without time zone,
  planned_end_at time without time zone,
  due_date date,
  due_at timestamptz,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  completed_at timestamptz,
  board_rank numeric not null default 0,
  version integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_workspace_id_id_key unique (workspace_id, id),
  constraint tasks_planned_time_check check (planned_end_at is null or planned_start_at is null or planned_end_at > planned_start_at),
  constraint tasks_project_fk foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete set null,
  constraint tasks_key_result_fk foreign key (workspace_id, key_result_id) references public.key_results(workspace_id, id) on delete set null,
  constraint tasks_parent_task_fk foreign key (workspace_id, parent_task_id) references public.tasks(workspace_id, id) on delete cascade
);

create trigger update_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- Task completed_at trigger
create or replace function public.handle_task_status_completed_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'done' then
    if TG_OP = 'INSERT' or old.status <> 'done' then
      new.completed_at := coalesce(new.completed_at, now());
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger tasks_completed_at_trigger
  before insert or update on public.tasks
  for each row
  execute function public.handle_task_status_completed_at();

-- Task optimistic concurrency version increment trigger
create or replace function public.handle_task_version_increment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  return new;
end;
$$;

create trigger tasks_version_trigger
  before update on public.tasks
  for each row
  execute function public.handle_task_version_increment();

-- Single-level subtask depth rule & self-parent prevention trigger
create or replace function public.check_task_subtask_depth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.parent_task_id is not null then
    -- Reject self-parenting
    if new.id is not null and new.parent_task_id = new.id then
      raise exception 'Task cannot be its own parent' using errcode = 'check_violation';
    end if;

    -- Reject subtask if parent is already a subtask (single-level rule)
    if exists (
      select 1 from public.tasks p
      where p.id = new.parent_task_id
        and p.parent_task_id is not null
    ) then
      raise exception 'Subtask depth exceeded: parent task is already a subtask'
        using errcode = 'check_violation';
    end if;

    -- Reject if this task already has subtasks (cannot make a parent task into a subtask)
    if new.id is not null and exists (
      select 1 from public.tasks c
      where c.parent_task_id = new.id
    ) then
      raise exception 'Task with subtasks cannot be made a subtask'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger tasks_subtask_rules_trigger
  before insert or update on public.tasks
  for each row
  execute function public.check_task_subtask_depth();

-- ==========================================
-- 7. TASK LABELS JUNCTION TABLE
-- ==========================================
create table if not exists public.task_labels (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null,
  label_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (task_id, label_id),
  constraint task_labels_task_fk foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  constraint task_labels_label_fk foreign key (workspace_id, label_id) references public.labels(workspace_id, id) on delete cascade
);

-- ==========================================
-- 8. INDEXES
-- ==========================================
create index if not exists tasks_workspace_status_idx on public.tasks (workspace_id, status) where deleted_at is null;
create index if not exists tasks_workspace_planned_date_idx on public.tasks (workspace_id, planned_date) where deleted_at is null;
create index if not exists tasks_workspace_due_date_idx on public.tasks (workspace_id, due_date) where deleted_at is null;
create index if not exists tasks_workspace_project_id_idx on public.tasks (workspace_id, project_id);
create index if not exists tasks_workspace_parent_task_id_idx on public.tasks (workspace_id, parent_task_id);
create index if not exists project_milestones_project_id_idx on public.project_milestones (project_id, sort_order);

-- ==========================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ==========================================
alter table public.projects enable row level security;
alter table public.project_objectives enable row level security;
alter table public.project_key_results enable row level security;
alter table public.project_milestones enable row level security;
alter table public.labels enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;

-- Projects RLS
create policy "projects_select" on public.projects
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "projects_insert" on public.projects
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "projects_update" on public.projects
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "projects_delete" on public.projects
  for delete to authenticated using (public.is_workspace_owner(workspace_id));

-- Project Objectives RLS
create policy "project_objectives_select" on public.project_objectives
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "project_objectives_insert" on public.project_objectives
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "project_objectives_update" on public.project_objectives
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "project_objectives_delete" on public.project_objectives
  for delete to authenticated using (public.is_workspace_owner(workspace_id));

-- Project Key Results RLS
create policy "project_key_results_select" on public.project_key_results
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "project_key_results_insert" on public.project_key_results
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "project_key_results_update" on public.project_key_results
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "project_key_results_delete" on public.project_key_results
  for delete to authenticated using (public.is_workspace_owner(workspace_id));

-- Project Milestones RLS
create policy "project_milestones_select" on public.project_milestones
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "project_milestones_insert" on public.project_milestones
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "project_milestones_update" on public.project_milestones
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "project_milestones_delete" on public.project_milestones
  for delete to authenticated using (public.is_workspace_owner(workspace_id));

-- Labels RLS
create policy "labels_select" on public.labels
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "labels_insert" on public.labels
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "labels_update" on public.labels
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "labels_delete" on public.labels
  for delete to authenticated using (public.is_workspace_owner(workspace_id));

-- Tasks RLS
create policy "tasks_select" on public.tasks
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "tasks_insert" on public.tasks
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "tasks_update" on public.tasks
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "tasks_delete" on public.tasks
  for delete to authenticated using (public.is_workspace_owner(workspace_id));

-- Task Labels RLS
create policy "task_labels_select" on public.task_labels
  for select to authenticated using (public.is_workspace_owner(workspace_id));
create policy "task_labels_insert" on public.task_labels
  for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy "task_labels_update" on public.task_labels
  for update to authenticated using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "task_labels_delete" on public.task_labels
  for delete to authenticated using (public.is_workspace_owner(workspace_id));
