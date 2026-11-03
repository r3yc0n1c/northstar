import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Database & RLS Schema Migrations', () => {
  const migrationsDir = path.resolve(import.meta.dirname, '../migrations');

  it('contains the ordered Phase 1 migration files', () => {
    const files = fs.readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql'));
    expect(files).toContain('20261103000001_create_profiles.sql');
    expect(files).toContain('20261103000002_create_workspaces.sql');
    expect(files).toContain('20261103000003_functions_and_triggers.sql');
    expect(files).toContain('20261103000004_rls_policies.sql');
  });

  it('defines the profiles table with constraints and checks', () => {
    const content = fs.readFileSync(
      path.join(migrationsDir, '20261103000001_create_profiles.sql'),
      'utf-8',
    );
    expect(content).toContain('create table if not exists public.profiles');
    expect(content).toContain('references auth.users (id) on delete cascade');
    expect(content).toContain('week_starts_on between 0 and 6');
    expect(content).toContain("jsonb_typeof(working_hours) = 'object'");
    expect(content).toContain('onboarding_completed_at timestamptz');
  });

  it('defines the workspaces table with owner_id unique reference and id uniqueness', () => {
    const content = fs.readFileSync(
      path.join(migrationsDir, '20261103000002_create_workspaces.sql'),
      'utf-8',
    );
    expect(content).toContain('create table if not exists public.workspaces');
    expect(content).toContain('references public.profiles (id) on delete cascade');
    expect(content).toContain('owner_id uuid unique not null');
    expect(content).toContain('constraint workspaces_id_key unique (id)');
  });

  it('defines functions and triggers with fixed search_path and proper grants', () => {
    const content = fs.readFileSync(
      path.join(migrationsDir, '20261103000003_functions_and_triggers.sql'),
      'utf-8',
    );
    // set_updated_at
    expect(content).toContain('function public.set_updated_at()');
    expect(content).toContain("set search_path = ''");
    expect(content).toContain('trigger set_profiles_updated_at');
    expect(content).toContain('trigger set_workspaces_updated_at');

    // handle_new_user
    expect(content).toContain('function public.handle_new_user()');
    expect(content).toContain('security definer');
    expect(content).toContain('revoke all on function public.handle_new_user() from public;');
    expect(content).toContain('trigger on_auth_user_created');
    expect(content).toContain('after insert on auth.users');

    // is_workspace_owner
    expect(content).toContain('function public.is_workspace_owner(ws uuid)');
    expect(content).toContain('stable');
    expect(content).toContain(
      'grant execute on function public.is_workspace_owner(uuid) to authenticated;',
    );
    expect(content).toContain(
      'revoke all on function public.is_workspace_owner(uuid) from public;',
    );
  });

  it('enforces RLS and owner-only policies with (select auth.uid()) and WITH CHECK', () => {
    const content = fs.readFileSync(
      path.join(migrationsDir, '20261103000004_rls_policies.sql'),
      'utf-8',
    );
    expect(content).toContain('alter table public.profiles enable row level security;');
    expect(content).toContain('alter table public.workspaces enable row level security;');
    expect(content).toContain('id = (select auth.uid())');
    expect(content).toContain('owner_id = (select auth.uid())');
    expect(content).toContain('with check (id = (select auth.uid()))');
    expect(content).toContain('with check (owner_id = (select auth.uid()))');
    // Ensure no client insert or delete policies exist
    expect(content).not.toContain('for insert');
    expect(content).not.toContain('for delete');
  });

  it('documents the workspace RLS pattern and composite foreign key strategy in docs/rls.md', () => {
    const docsPath = path.resolve(import.meta.dirname, '../../docs/rls.md');
    expect(fs.existsSync(docsPath)).toBe(true);
    const content = fs.readFileSync(docsPath, 'utf-8');
    expect(content).toContain('public.is_workspace_owner(workspace_id)');
    expect(content).toContain('composite key');
    expect(content).toContain('kr_check_ins');
  });
});
