# AGENTS.md — Northstar

Northstar is a personal operating system: life areas → goals → OKRs → projects → tasks → daily planning → habits → reviews. Personal use first, public-ready later. Requirements live in `docs/PRD.md`. Read the relevant PRD sections before every task. If this file and the PRD disagree, stop and ask.

## Stack (MVP)
- Vite + React + TypeScript (strict). pnpm. React Router (library/data mode).
- Tailwind CSS 4 with CSS variables as design tokens. shadcn/ui on Radix. Lucide icons.
- React Hook Form + Zod. TanStack Query. @dnd-kit for drag and drop. Recharts for the three embedded charts only.
- Supabase (Auth + Postgres + RLS) via `@supabase/supabase-js`. SQL migrations in `supabase/migrations`. Generated types in `src/lib/database.types.ts`.
- Dates: `date-fns` + `@date-fns/tz`; format with `Intl` using profile locale/timezone.
- Tests: Vitest, Testing Library, Playwright, SQL/pgTAP tests for the database.
- Hosting: Cloudflare static hosting. No server code in MVP. No Cloudflare Worker until the Calendar phase.
- Fonts: Plus Jakarta Sans + IBM Plex Mono via `@fontsource-variable/plus-jakarta-sans` and `@fontsource-variable/ibm-plex-mono`. Self-hosted only.

## Commands (keep these working at all times)
- `pnpm dev` | `pnpm build` | `pnpm typecheck` | `pnpm lint` | `pnpm format:check`
- `pnpm test` (unit) | `pnpm test:db` (database/RLS) | `pnpm test:e2e` (Playwright)
- `pnpm check` = typecheck + lint + format:check + test + test:db (must pass before any commit)
- `pnpm db:reset` (supabase db reset) | `pnpm db:types` (regenerate types)

## Architecture rules
- Modular monolith inside the SPA:
  - `src/domain/` — pure TypeScript business logic (KR progress, health, streaks, capacity, cycles, dates, task rules). No React, no Supabase, no I/O. Every function has unit tests.
  - `src/features/<name>/` — `components/`, `hooks/`, `api/` (Supabase calls), `schema.ts` (Zod), `index.ts`. Features never import another feature's internals; share through `domain/`, `lib/`, `components/`.
  - `src/lib/` — supabase client, query client, formatters, errors.
  - `src/components/ui/` — shadcn primitives restyled to tokens.
- All Supabase access goes through each feature's `api/` layer, typed with generated types. Components never call `supabase` directly.
- Validate every external input (forms, URL params, JSON columns, imports) with Zod.
- Server state in TanStack Query with a central query-key factory; optimistic updates must roll back on error.
- No second ORM or data layer. No new infrastructure without asking.

## Database rules
- SQL migrations are the schema source of truth. Never change schema outside a migration. One concern per migration, ordered, idempotent where practical.
- Every public table: `id uuid pk default gen_random_uuid()`, `workspace_id uuid not null` (except profiles/workspaces), `created_at`, `updated_at` (trigger), RLS **enabled**, explicit policies.
- Enumerations are `text` + `CHECK`. Instants `timestamptz`; local calendar days `date`; measurements `numeric`.
- Cross-workspace integrity: unique `(workspace_id, id)` on parents and composite FKs `(workspace_id, parent_id)` on children.
- Policies: `(select auth.uid())`; both `USING` and `WITH CHECK` on writes. `kr_check_ins` has **no UPDATE or DELETE policy**.
- `SECURITY DEFINER` functions must set `search_path = ''` (or a fixed list), qualify all names, and be granted only to the roles that need them.
- Every new table is added to the two-user RLS test matrix in the same change.
- Never use or expose the service-role key in `src/`, `.env.example`, CI logs, or client bundles. Scripts that need it live in `scripts/`, run locally, and refuse to run against production without an explicit flag.

## Product rules (do not violate)
- Completing a task never changes a key result value.
- KR check-ins are append-only; corrections use `supersedes_id`.
- Health is derived (progress vs elapsed time), never typed. Progress, health, and confidence are shown as three separate things.
- Planned date and due date are independent. Never silently move, reschedule, or complete tasks. Carry-over requires explicit user action.
- Missing data is not zero (show "unestimated", "No key results yet", "No data").
- Habits: `missed` is derived; `skipped` and `partial` are neutral for streaks.
- Reviews and notes are private; never log their content.
- Core flows work with no AI and no Calendar. Do not add AI, Calendar, push, offline, recurrence, dependencies, timers, notes, command palette, or collaboration in the MVP.

## UI and design rules
- Dark only in MVP. Use tokens only; **no raw hex values in components**. Tokens (CSS variables in `src/styles/tokens.css`):
  - `--bg #121019` · `--surface #1E1B2E` · `--surface-2 #262238` · `--border #40375C` · `--accent #5A4F7C` · `--accent-hover #675B8C` · `--highlight #9D8DF1`
  - `--text #ECE9F6` · `--text-2 #A39FB8` · `--text-3 #6F6A87` (disabled only)
  - `--success #6FCF97` · `--warning #E8B866` · `--danger #E5707F`
- IBM Plex Mono for UI; **IBM Plex Mono for all numbers, dates, times, durations, percentages, KR values, streaks, shortcuts** (`font-variant-numeric: tabular-nums`).
- Radius 6px controls / 10px cards; 1px borders; no gradients, glass, or decorative shadows (menus and dialogs only).
- Focus ring: 2px `--highlight`, 2px offset, always visible. Respect `prefers-reduced-motion`.
- Status is never color alone: icon + text + color. Icon buttons need accessible labels. 44px touch targets on mobile.
- Follow layouts in `design/` for structure and spacing, but use real tokens and fonts; if a design conflicts with this file, this file wins.
- Every list has loading (skeleton), empty (icon + sentence + one action), and error (retry) states.

## Security rules
- Auth: Supabase Auth, email+password (confirmation required, min 10 chars) and Google (scopes `openid email profile` only). Generic auth error messages. No magic links.
- Session is managed by supabase-js. Strict CSP, no `dangerouslySetInnerHTML`, sanitize any rendered Markdown. No secrets in code, tests, fixtures, or screenshots.
- Do not log PII or private text content.

## Workflow rules
1. Start every task by reading the relevant PRD sections and stating a short plan (files to create/change, migrations, tests).
2. Build vertical slices: migration → constraints/RLS → regenerate types → domain logic + tests → API layer → UI → tests.
3. Write tests alongside code. Domain logic needs unit tests; schema changes need DB tests; user flows need component or E2E tests.
4. Run `pnpm check` before declaring anything done. Fix failures; never skip, disable, or weaken tests to get green.
5. Small, reviewable commits. Do not refactor unrelated code. Do not add dependencies without stating why; prefer what's already in the stack. Pin exact versions.
6. If requirements are ambiguous or conflict, stop and ask one specific question rather than guessing.
7. At the end of each phase, output: what was built, what was deferred, exit-criteria checklist with pass/fail, and any open risks.

## Definition of done (per change)
Typecheck, lint, format, unit and DB tests green; RLS matrix updated; loading/empty/error states present; keyboard operable; formatted with locale/timezone helpers; docs updated if behavior or setup changed.