-- Migration 00002: Create workspaces table
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique not null references public.profiles (id) on delete cascade,
  name text not null default 'Personal',
  vision text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_id_key unique (id)
);

comment on table public.workspaces is 'Workspaces owned by users. Children tables enforce isolation via composite key (workspace_id, id).';
