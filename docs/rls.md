# Row Level Security (RLS) Strategy & Policy Guide

This document defines the Row Level Security (RLS) architecture, policies, and patterns for Northstar.

---

## 1. Core Principles

1. **Deny by default**: Every public table has Row Level Security enabled (`alter table public.<t> enable row level security;`). Without an explicit policy, no rows can be read or mutated.
2. **Untrusted client environment**: The client application operates solely with the public `anon` (publishable) key. All data access boundaries are strictly enforced inside Postgres.
3. **Plan caching optimization**: Policies use sub-select syntax `(select auth.uid())` rather than `auth.uid()` directly. This allows PostgreSQL's query optimizer to evaluate the session identity once per query instead of per row.
4. **No cross-workspace row movement**: Every `INSERT` and `UPDATE` policy includes a `WITH CHECK` clause ensuring records cannot be transferred between workspaces.
5. **Defense-in-depth with composite keys**: Child tables use composite keys `(workspace_id, id)` and composite foreign keys `(workspace_id, parent_id)` so foreign references across workspace boundaries are structurally rejected by Postgres constraints even if a policy is misconfigured.

---

## 2. Core Identity & Provisioning

### 2.1 Profiles (`public.profiles`)
- **Row ID**: Matches `auth.users.id`.
- **Provisioning**: Created automatically by the `handle_new_user()` trigger on `auth.users` (`SECURITY DEFINER`).
- **Client Permissions**:
  - `SELECT`: Can only view their own profile (`id = (select auth.uid())`).
  - `UPDATE`: Can only update their own profile (`id = (select auth.uid())`).
  - `INSERT`: Forbidden to clients (managed via trigger).
  - `DELETE`: Forbidden to clients (cascades from `auth.users` on user deletion).

### 2.2 Workspaces (`public.workspaces`)
- **Owner ID**: References `public.profiles(id)` (`unique not null`). In MVP, each user has exactly one personal workspace.
- **Provisioning**: Created automatically alongside the profile in the `handle_new_user()` transaction.
- **Client Permissions**:
  - `SELECT`: Can only view owned workspaces (`owner_id = (select auth.uid())`).
  - `UPDATE`: Can only update owned workspaces (`owner_id = (select auth.uid())`).
  - `INSERT`: Forbidden to clients (managed via trigger).
  - `DELETE`: Forbidden to clients.

---

## 3. Standard Policy Pattern for Future Workspace Tables

Every entity belonging to a workspace (`domains`, `goals`, `cycles`, `objectives`, `key_results`, `projects`, `tasks`, `habits`, `reviews`, etc.) must include `workspace_id uuid not null references public.workspaces(id) on delete cascade` and adhere to this canonical pattern:

```sql
alter table public.<t> enable row level security;

create policy "<t>_select"
on public.<t>
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy "<t>_insert"
on public.<t>
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy "<t>_update"
on public.<t>
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "<t>_delete"
on public.<t>
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));
```

### Future Extensibility
The helper `is_workspace_owner(ws uuid)` is defined as:
```sql
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
```
When multi-user or shared workspaces are added post-MVP, only the body of `is_workspace_owner` needs to be updated (to check `workspace_members`). All existing table policies remain completely untouched.

---

## 4. Special Exceptions

### Append-Only Key Result Check-Ins (`public.kr_check_ins`)
Per PRD §5.5 and §10:
- Check-ins are append-only to preserve auditable history.
- `SELECT`: Allowed for workspace owner.
- `INSERT`: Allowed for workspace owner (`WITH CHECK`).
- `UPDATE`: **No policy** (forbidden).
- `DELETE`: **No policy** (forbidden).
- Corrections are made by submitting a new check-in referencing `supersedes_id`.

---

## 5. Composite Foreign Key Constraint Strategy

To guarantee cross-workspace data isolation at the schema layer:
1. Every parent table defines a unique constraint on `(workspace_id, id)`:
   ```sql
   constraint <parent>_workspace_id_id_key unique (workspace_id, id)
   ```
2. Every child table references both columns:
   ```sql
   constraint <child>_<parent>_fkey foreign key (workspace_id, <parent>_id)
     references public.<parent> (workspace_id, id)
     on delete cascade
   ```
This prevents orphaned child rows from ever attaching to parent rows in another workspace.

---

## 6. Two-User Automated RLS Test Matrix Harness

Northstar includes an automated two-user database test suite (`supabase/tests/rls-matrix.test.ts` and `supabase/tests/harness/matrix.ts`) executed on every build via `pnpm test:db`.

It verifies:
1. **Real authenticated roles**: Uses two distinct authenticated users provisioned via Gotrue with real JWT tokens.
2. **Read isolation**: User A sees zero rows belonging to User B across all workspace and identity tables.
3. **Write isolation (WITH CHECK)**: Attempting to insert a row with another user's `workspace_id` fails with an RLS policy violation.
4. **Update isolation**: Cross-user updates are rejected, modifying zero rows.
5. **Delete isolation**: Cross-user deletions are rejected, deleting zero rows.
6. **Composite foreign key integrity**: Cross-workspace parent references (e.g. User A goal referencing User B domain) are structurally blocked by Postgres composite foreign keys (`23503`).
7. **Append-only verification**: Immutability support ensuring tables like `kr_check_ins` reject both owner and non-owner `UPDATE` and `DELETE` queries.
8. **Extensible helper**: Adding a new table to the isolation matrix requires only a declarative `testTableIsolation({...})` specification.
