# Northstar — Product Requirements Document

> **Product promise:** Turn what matters into measurable outcomes, realistic plans, and consistent daily action.

|                |                                         |
| -------------- | --------------------------------------- |
| **Version**    | 1.0 (simplified MVP)                    |
| **Status**     | Draft for build                         |
| **Date**       | 2 November 2026                         |
| **Audience**   | Personal use first; public-ready later  |
| **Supersedes** | Original planning doc (v1, 23 sections) |

---

## 0. What changed from the original planning doc

This version keeps the product thesis (direction → outcomes → initiatives → execution → reflection) and cuts everything that is not needed to prove it.

| Area                     | Original                                         | This PRD                                                                                          |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Home screen              | Overview **and** Today                           | **Today is the home screen.** Overview merged in                                                  |
| Navigation               | 17 screens, 5 groups                             | **7 primary destinations** + Settings                                                             |
| Stack                    | React Router v8 SSR on Cloudflare Workers        | **Vite + React SPA + Supabase.** Worker added only in the Calendar phase                          |
| Workspace model          | `workspace_members` + role-aware RLS             | **Owner-only RLS.** `workspace_id` on every table; membership table deferred                      |
| Cycle types              | Daily/Weekly/Monthly/Quarterly/Annual/Custom     | **Monthly, Quarterly, Annual, Custom.** Daily/weekly are covered by daily plans and reviews       |
| KR types                 | Numeric, Percentage, Binary, Milestone, Currency | **Numeric and Binary.** Percent and currency are numeric with a unit. Milestone-type KRs deferred |
| KR fields                | Confidence, health, status, weight               | **Confidence (user, 1–10)** and **derived health.** Weights deferred (equal weighting)            |
| Task recurrence          | MVP                                              | **Later**                                                                                         |
| Task dependencies        | MVP                                              | **Later** (subtasks stay, one level)                                                              |
| Time tracking            | Manual + timer + focus mode                      | **Manual entries only.** Timer and focus mode later                                               |
| Notes area               | MVP                                              | **Later.** Entities keep a plain description/notes field                                          |
| Search / command palette | MVP                                              | **Later.** Per-list filters and `Q` quick capture only                                            |
| Analytics                | Dedicated screen                                 | **Three embedded views** (KR history, planned vs completed, habit consistency)                    |
| Audit tables             | `activity_logs`, `ai_proposals`, `import_jobs`   | **Deferred.** Check-ins carry their own history                                                   |
| Themes                   | Dark/light/system                                | **Dark only** for MVP. Tokens are semantic so light can be added later                            |
| Export                   | Phase 9 (last)                                   | **Phase 3** (before real data accumulates)                                                        |
| Habit "missed"           | Logged status                                    | **Derived** (scheduled day, no entry, day passed). "Skipped" is logged                            |

### Assumptions I made that you should confirm

1. **Dark-only MVP.** You asked for a dark UI, so the light theme is deferred.
2. **Status colors (success, warning, danger) and text colors are derived** by me, because your palette has five colors. See §7.
3. **Currency defaults** are inferred from the locale region via a small lookup, falling back to USD, and are always editable.
4. **Hosting** is Cloudflare static hosting. Verify whether Pages or Workers static assets is the current recommendation in the Phase 0 spike.

---

## 1. Executive summary

Northstar is a personal operating system that connects long-term direction to everyday execution. It combines life areas, goals, OKRs, projects, tasks, daily planning, habits, and structured reviews in one coherent product.

It is **personal-first, private by default, portable, and fully usable without AI or any integration.** One account has one private workspace. The data model carries `workspace_id` everywhere so future shared workspaces do not require a rewrite, but collaboration, billing, Calendar, AI, push, and offline are explicitly **post-MVP**.

### 1.1 Product outcomes

Northstar succeeds when a user can:

1. Express long-term direction as life areas and goals.
2. Turn goals into time-bound objectives with measurable key results.
3. Connect projects and tasks to outcomes without forcing every task into an OKR.
4. Plan a realistic day and see overcommitment before it happens.
5. Track habits independently of tasks.
6. Reflect through daily and weekly reviews.
7. See meaningful progress and spot stalled work.
8. Export all of their data at any time.

### 1.2 Positioning

Not a team project suite, not a streak counter, not a chatbot on a task list. The differentiator is the relationship between **direction → outcomes → initiatives → execution → reflection**, and the honesty of the numbers (task completion is never presented as outcome achievement).

---

## 2. Principles

1. **Outcomes over activity.** Finishing tasks is not proof an objective was achieved.
2. **One source of truth.** Clear ownership and relationships, no duplicated records.
3. **Capture before organization.** Adding an item takes seconds; classification comes later.
4. **Evidence-based progress.** Progress changes are explainable and historically traceable.
5. **Realistic planning.** Make overcommitment visible; never silently rewrite dates.
6. **Private by default.** Journal and review content never leaves the user's workspace.
7. **Portable.** Full export is a core feature, not an upsell.
8. **Progressive complexity.** Advanced planning must not obstruct simple daily execution.
9. **Boring architecture.** Modular monolith, one data-access layer, no infrastructure without a demonstrated need.

---

## 3. Users and journeys

### 3.1 Initial user

One individual (you), who wants to manage career, personal, and learning goals, plan days, and keep routines. Secondary archetypes (developer/creator, freelancer) are served by the same features.

### 3.2 Primary journeys

**A. Direction → execution (the first vertical slice and the P0 acceptance test)**
Sign in → create life area → create goal → create cycle → create objective → add KR → create project → add task → plan it for today → complete it → record a KR check-in → see Today and OKR screens update.

**B. Daily planning**
Open Today → review carry-over → pick Big Three → add tasks to the day with optional time blocks → see load vs capacity → execute → complete daily review.

**C. Habit tracking**
Create habit with schedule and target → log done / partial / skipped → review consistency and streak.

**D. Reflection**
Complete daily review → at week end, open weekly review with an auto-generated deterministic summary → write answers → save.

---

## 4. Scope

### 4.1 MVP (P0) — everything below ships online-only

| Domain              | Included                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Auth                | Email + password (verification, reset), Google sign-in, sign out                                                           |
| Workspace           | One personal workspace auto-provisioned per account                                                                        |
| Profile & settings  | Display name, avatar (initials fallback), timezone, locale, currency, week start, working days/hours                       |
| Life areas & vision | CRUD, reorder, color, archive; one vision statement                                                                        |
| Goals & cycles      | Goals with status/priority/dates; Monthly/Quarterly/Annual/Custom cycles                                                   |
| OKRs                | Objectives, KRs (numeric, binary), append-only check-ins, derived health, user confidence                                  |
| Projects            | CRUD, status, milestones, links to objectives/KRs                                                                          |
| Tasks               | CRUD, subtasks (1 level), labels, priority, status, estimate, planned vs due, Inbox, list view, Kanban, bulk actions, undo |
| Daily execution     | Today, daily plan, Big Three, capacity, time blocks, carry-over, manual time entries                                       |
| Habits              | CRUD, schedules, logging, derived missed, streaks, history                                                                 |
| Reviews             | Daily and weekly with versioned templates and deterministic summaries                                                      |
| Analytics           | Three embedded views (see §4.3)                                                                                            |
| Portability         | Full JSON export, CSV exports, restore script and documented restore test                                                  |
| Platform            | Responsive layouts (mobile variants for Today, Inbox, Habits), installable PWA shell, CI/CD, RLS tests                     |

### 4.2 Later (post-MVP), each is its own epic or story

Google Calendar read-only sync (introduces the Cloudflare Worker), in-app notifications, browser push, offline capture with Dexie and mutation outbox, AI schedule/review/capture proposals, task dependencies, task recurrence, timer and focus mode, notes area, command palette and universal search, import UI (JSON/CSV with preview), light and system themes, shared workspaces and membership, billing, two-way calendar sync.

### 4.3 The three embedded analytics views

1. **KR progress history** — on Objective detail (line chart of check-ins with target line).
2. **Planned vs completed tasks** — in Weekly review (with denominators and date range).
3. **Habit consistency** — on Habits (completion rate by week, streaks).

Rules: show denominators and date ranges, distinguish missing data from zero, never produce an opaque "productivity score".

### 4.4 Sequencing rule

Do not add Calendar, AI, push, or offline until the online core workflow is reliable and exported data has been restored successfully at least once.

---

## 5. Functional requirements

Requirement IDs are stable and referenced by Jira tickets and build prompts. "AC" = acceptance criteria.

### 5.1 Authentication and account (FR-AUTH)

**User stories**

- As a new user I can sign up with email and password and verify my email.
- As a user I can sign in with Google in one click.
- As a user I can reset a forgotten password.
- As a user I can sign out and be sure my session is cleared.

**Requirements**

- **FR-AUTH-1 Email + password sign-up.** Fields: email, password, confirm password. Password minimum length 10 characters. Show a strength hint. After submit, show a "check your email" state with a resend action (rate-limited in UI).
- **FR-AUTH-2 Email verification required.** An unverified user cannot reach the app. Clicking the link signs them in and lands on onboarding.
- **FR-AUTH-3 Email + password sign-in.** Generic error for wrong credentials ("Email or password is incorrect") to avoid account enumeration. Unverified accounts see a resend-verification prompt.
- **FR-AUTH-4 Google sign-in.** One button on both sign-in and sign-up screens. Scopes are `openid email profile` only. Calendar access is a separate, later consent.
- **FR-AUTH-5 Password reset.** Request screen (always shows the same confirmation regardless of whether the email exists) → email link → set-new-password screen (handles Supabase's password-recovery event) → redirected to Today.
- **FR-AUTH-6 Account linking.** If a Google sign-in uses an email that already has a password account, identities link only when the email is verified. Verify Supabase's current linking behavior during Phase 1 and test both orders.
- **FR-AUTH-7 Route protection.** Unauthenticated users are redirected to sign-in and returned to their original URL afterward. Authenticated users hitting auth pages are redirected to Today.
- **FR-AUTH-8 Sign out.** Clears session and in-memory query cache.
- **FR-AUTH-9 Auto-provisioning.** On first sign-in a profile and personal workspace exist (created by a database trigger, not client code).

**AC highlights:** wrong password never reveals whether the email exists; a user cannot create data before verification; sign-out then pressing Back never shows private data; both Google and password sign-in create exactly one profile and one workspace.

### 5.2 Profile and settings (FR-SET)

- **FR-SET-1** Edit display name; avatar shows initials when no image.
- **FR-SET-2** IANA timezone (default from browser), locale (default from browser), currency (default from locale region, fallback USD), week start (default from locale, fallback Monday).
- **FR-SET-3** Working days and per-day working hours. These drive default daily capacity.
- **FR-SET-4** Danger zone: export all data, sign out everywhere. Account deletion is documented as a manual procedure before public release.
- **FR-SET-5** All dates, numbers, and currency are formatted with `Intl` using the profile locale and timezone.

### 5.3 Onboarding (FR-ONB)

- Skippable at every step; skipping lands on an empty Today with a prominent quick-capture.
- Steps: (1) confirm timezone and working hours, (2) pick starter life areas (Career, Health, Learning, Finance, Relationships, Personal projects — all optional), (3) optional first goal.
- Never blocks capture.

### 5.4 Life areas, vision, goals (FR-GOAL)

- **FR-GOAL-1** Life areas: create, rename, reorder, color, archive, restore.
- **FR-GOAL-2** One vision statement per workspace (plain text, editable).
- **FR-GOAL-3** Goals: title, description, life area (optional), priority, status (`active`, `on_hold`, `completed`, `archived`), start and target dates.
- **FR-GOAL-4** A goal may exist without objectives; a goal may be linked by objectives in several cycles.
- **FR-GOAL-5** No task or project is required to belong to a goal.
- **FR-GOAL-6** Archiving a life area or goal never deletes children; it hides them behind an "Archived" filter.

### 5.5 Cycles and OKRs (FR-OKR)

**Cycles.** Types `monthly`, `quarterly`, `annual`, `custom`. Fields: name, start date, end date, status (`planned`, `active`, `closed`). Dates are local calendar `DATE`s. Validation: end ≥ start. Overlap between cycles is allowed (a quarter and a month overlap by design).

**Objectives.** Title, description, optional goal, cycle (required), priority, status (`draft`, `active`, `achieved`, `abandoned`), start and due dates (default to the cycle's), confidence 1–10 (user-set), derived health.

**Key results.**

| Field                                             | Notes                                                  |
| ------------------------------------------------- | ------------------------------------------------------ |
| title, description                                |                                                        |
| `metric_type`                                     | `numeric` or `binary`                                  |
| `baseline_value`, `current_value`, `target_value` | `NUMERIC`; binary uses 0 and 1                         |
| `unit`                                            | free text (`%`, `interviews`, `kg`)                    |
| `currency_code`                                   | optional ISO 4217; when set, values render as currency |
| `direction`                                       | `increase` or `decrease` (numeric only)                |
| `confidence`                                      | 1–10, user-set                                         |
| `start_date`, `due_date`                          | default to objective's                                 |

**Progress formulas (single definition, implemented in SQL and mirrored in TypeScript with shared test fixtures):**

- Increase: `raw = (current − baseline) / (target − baseline) × 100`
- Decrease: `raw = (baseline − current) / (baseline − target) × 100`
- Binary: `0` or `100`
- Displayed progress = `clamp(raw, 0, 100)`. The raw value and actual current value are always preserved.
- Validation: reject `target == baseline` for numeric KRs; reject `direction = increase` with `target < baseline` (and vice versa).

**Check-ins (append-only).**

- A check-in records: value, confidence (optional), notes, evidence URL (optional), recorded_at, recorded_by, and the progress snapshot at that time.
- Normal workflows have **no edit or delete.** Corrections create a new check-in with `supersedes_id` pointing at the one being corrected. The KR's `current_value` is the value of the most recent non-superseded check-in.
- Recording a check-in is one atomic database function (inserts the row and updates `current_value`).
- Completing tasks never changes KR values.

**Objective progress** = arithmetic mean of its KRs' displayed progress (equal weighting). An objective with no KRs shows "No key results yet", never 0%.

**Health (derived, never typed):**

```
elapsed%  = clamp((today − start) / (due − start), 0, 1) × 100
expected% = elapsed%
gap       = expected% − displayed progress
health:
  not_started   if today < start
  achieved      if progress ≥ 100
  on_track      if gap ≤ 10
  at_risk       if 10 < gap ≤ 25
  off_track     if gap > 25
```

Thresholds are named constants in one module. Health is computed per KR and per objective (from objective progress vs the objective's window). Health is shown with an icon and a text label, not color alone. Confidence, progress, and health are three separate displays.

**AC highlights:** increasing, decreasing, and binary KRs give correct progress at boundaries (at baseline, at target, beyond target, regressing below baseline); a correction never removes history; objective health is not influenced by task completion.

### 5.6 Projects and milestones (FR-PROJ)

- **FR-PROJ-1** Create, edit, archive, restore. Fields: title, description, status (`planned`, `active`, `on_hold`, `completed`, `archived`), priority, life area, start date, due date.
- **FR-PROJ-2** Link a project to zero or more objectives and zero or more KRs.
- **FR-PROJ-3** Milestones: title, due date, status (`open`, `done`), completed date, order.
- **FR-PROJ-4** Project detail shows milestones, tasks (grouped by status), linked outcomes, and attention flags.
- **FR-PROJ-5** Project progress is shown as "X of Y tasks done" and "X of Y milestones done", never as a percent-of-outcome.
- **Attention flags (deterministic):** overdue milestone; N overdue tasks; stalled (no task created, completed, or edited in 14 days while status is `active`).

### 5.7 Tasks (FR-TASK)

| Field               | Rule                                                             |
| ------------------- | ---------------------------------------------------------------- |
| title               | required                                                         |
| description         | optional (plain text/Markdown)                                   |
| status              | `inbox`, `todo`, `in_progress`, `blocked`, `done`, `cancelled`   |
| priority            | `none`, `low`, `medium`, `high`, `urgent`                        |
| planned date        | optional local `DATE` (the day it is scheduled)                  |
| planned start/end   | optional time block                                              |
| due                 | optional deadline (`DATE`, optional time); distinct from planned |
| estimate            | optional minutes                                                 |
| project, key result | optional                                                         |
| parent task         | optional, **one level only**                                     |
| labels              | zero or more                                                     |
| `completed_at`      | set when status becomes `done`, cleared on reopen                |

Rules:

- **FR-TASK-1** Quick capture creates a task with status `inbox` and nothing else required.
- **FR-TASK-2** Planned date and due date are independent (scheduled Monday, due Friday).
- **FR-TASK-3** Unfinished tasks never silently become Done or silently move dates.
- **FR-TASK-4** A task can exist without project, KR, or parent.
- **FR-TASK-5** Deleting a parent with children prompts: "Delete only this task (children become top-level)" or "Delete task and subtasks".
- **FR-TASK-6** Delete is a soft delete with a 10-second undo toast. Bulk delete and bulk status/priority/label/date changes require confirmation and offer undo.
- **FR-TASK-7** Optimistic concurrency: every task carries an integer `version` incremented on update (foundation for later offline).
- **FR-TASK-8** Views: Inbox, Tasks list (group by status/project/priority/due, filters, sort), Kanban (columns = `todo`, `in_progress`, `blocked`, `done`; drag between columns; order persisted).
- **FR-TASK-9** Keyboard: `Q` opens quick capture when focus is not in an editable element; `Esc` closes dialogs.

### 5.8 Today and daily planning (FR-DAY)

Today is the home screen. Layout priority:

1. **Big Three** (up to three tasks)
2. **Today's plan**: ordered tasks for today, optional time blocks
3. **Right rail:** capacity gauge, habits due today, at-risk KRs (top 3), carry-over, start-review CTA

Requirements:

- **FR-DAY-1** One daily plan per workspace/user/local date, created lazily.
- **FR-DAY-2** Capacity defaults from the profile's working hours for that weekday and can be overridden for the day.
- **FR-DAY-3** Big Three is capped at three (enforced in the database and UI).
- **FR-DAY-4** Planned load = sum of estimates of planned tasks. Tasks without estimates count as zero and are surfaced as "N unestimated" (missing is not zero). If load > capacity show an overcommitment warning (non-blocking).
- **FR-DAY-5** Time blocks are optional; blocks on the same day may not overlap (validated, with a clear message).
- **FR-DAY-6** **Carry-over** lists tasks planned for earlier dates and not done. For each, the user chooses _Move to today_, _Reschedule…_, or _Leave_. Nothing changes automatically.
- **FR-DAY-7** Completed work is visually distinct from planned work; completing a task from Today updates `completed_at`.
- **FR-DAY-8** Manual time entries: add duration (and optional start, task, notes) from a task or from Today; edit and delete are allowed (this is not append-only data). Time totals appear per task and per project.

### 5.9 Habits (FR-HAB)

- **FR-HAB-1** Create, edit, pause, archive, restore. Fields: title, description, life area (optional), optional linked KR (informational only), schedule, target (value + unit, e.g. 20 min), start date, optional end date.
- **FR-HAB-2** Schedule types: `daily`, `weekdays` (selected days), `weekly_count` (N times per week).
- **FR-HAB-3** Entries per habit per local date: `done`, `partial`, `skipped`, with optional actual value and note. One entry per habit per date.
- **FR-HAB-4** **Missed is derived:** a scheduled past date with no entry. `skipped` is explicit and does not break a streak; `missed` does.
- **FR-HAB-5** **Streaks** (computed in the habit's timezone):
  - daily/weekdays: the streak is the count of consecutive scheduled days with a `done` entry. `skipped` and `partial` are **neutral** (they neither extend nor break the streak). A **missed** day (scheduled, no entry, day passed) breaks it.
  - weekly_count: consecutive weeks in which the number of `done` entries ≥ N.
- **FR-HAB-6** History and consistency: last 12 weeks completion rate (done ÷ scheduled, excluding skipped and paused days), current and best streak.
- **FR-HAB-7** A habit never updates a KR automatically.
- **FR-HAB-8** Mobile: one-tap logging from the due-today list.

### 5.10 Reviews (FR-REV)

Reviews are private and editable; each stores its **template version** so older reviews stay interpretable.

**Daily review (template v1):** accomplished; Big Three outcome; went well; didn't go well; blockers; learned; move to tomorrow.
**Weekly review (template v1):** planned vs completed; KR/objective changes; project health; habit consistency; where time went; wins; blocked/unresolved; next week's priorities.

- **FR-REV-1** One review per type per period (unique on type + period start).
- **FR-REV-2** Above the prompts, show a **deterministic summary** computed from data: tasks planned/completed/carried over, Big Three outcome, KR check-ins in period, habits completed vs scheduled, time by project, blocked tasks, projects with attention flags. The summary snapshot is stored with the review when saved.
- **FR-REV-3** Saving is explicit; drafts auto-save locally in memory only until saved (no silent persistence of partial private text beyond an explicit draft status).
- **FR-REV-4** Weekly review embeds the planned-vs-completed analytics view with denominators and date range.

### 5.11 Portability (FR-DATA)

- **FR-DATA-1** Full JSON export: versioned schema (`northstar_export_version`), all core records and relationships, timestamps, scoped strictly to the user's workspace.
- **FR-DATA-2** CSV exports: tasks, projects, goals, objectives, key results, check-ins, habits and habit entries, time entries.
- **FR-DATA-3** A **restore script** (developer tool, run locally with elevated credentials, never shipped to the client) rebuilds a clean workspace from a JSON export. A documented **restore test** runs in CI against a seeded database.
- **FR-DATA-4** Export is available from Settings and is generated client-side from RLS-protected queries (no server needed in MVP). For larger data, paginate.

---

## 6. Information architecture

### 6.1 Navigation (7 destinations + Settings)

| #   | Destination           | Contents                                                             |
| --- | --------------------- | -------------------------------------------------------------------- |
| 1   | **Today**             | Home. Big Three, plan, capacity, habits due, at-risk KRs, carry-over |
| 2   | **Inbox**             | Unprocessed captures                                                 |
| 3   | **Tasks**             | List and Kanban                                                      |
| 4   | **Goals**             | Vision, life areas, goals, OKRs (cycle selector) → Objective detail  |
| 5   | **Projects**          | List → Project detail                                                |
| 6   | **Habits**            | Due today, all habits, consistency                                   |
| 7   | **Reviews**           | Daily and weekly                                                     |
| —   | **Settings** (footer) | Profile, preferences, working hours, data export                     |

Desktop: collapsible left sidebar. Mobile: bottom tab bar with **Today, Inbox, Habits, Tasks, More** (Goals, Projects, Reviews, Settings under More), plus a floating quick-capture button.

### 6.2 Screens

| Screen                             | Primary content                                      | Key actions                     |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------- |
| Sign in / Sign up / Reset / Verify | Auth forms                                           | Email+password, Google          |
| Onboarding                         | 3 skippable steps                                    | Skip, continue                  |
| Today                              | See §5.8                                             | Plan, complete, carry over      |
| Inbox                              | Captured tasks                                       | Triage to project/date/priority |
| Tasks                              | List and Kanban, filters                             | Create, bulk edit               |
| Task detail (drawer)               | All fields, subtasks, time entries                   | Edit                            |
| Goals                              | Vision, cycle selector, objectives with KR summaries | Create, check in                |
| Objective detail                   | KRs, check-in history chart, linked projects         | Check in, edit                  |
| Projects                           | Cards/list with status and flags                     | Create                          |
| Project detail                     | Milestones, tasks, linked outcomes                   | Manage                          |
| Habits                             | Due today, list, consistency                         | Log                             |
| Reviews                            | Past reviews list, today's/this week's review        | Reflect, save                   |
| Settings                           | Profile and preferences, export                      | Configure                       |

### 6.3 Empty, loading, error

Every list has a purposeful empty state with one primary action. Loading uses skeletons that match layout. Errors are inline, specific, and recoverable (retry). No full-page spinners after first load.

---

## 7. Visual design system

**Direction:** minimal, dark, precise, calm. A deep violet-tinted neutral base with a restrained violet accent. Dense but readable. No gradients, glass effects, or decorative card grids.

### 7.1 Color tokens

Provided by you:

| Token                  | Hex       | Role                                                           |
| ---------------------- | --------- | -------------------------------------------------------------- |
| `--bg`                 | `#121019` | Obsidian app background                                        |
| `--surface`            | `#1E1B2E` | Cards, panels, sidebar                                         |
| `--border` / `--muted` | `#40375C` | Borders, dividers, subtle fills, progress tracks               |
| `--accent`             | `#5A4F7C` | Primary buttons, selected states, filled controls              |
| `--highlight`          | `#9D8DF1` | Interactive text, links, focus ring, active nav, progress fill |

Derived by me (adjust freely; not from your palette):

| Token            | Hex       | Role                                                      |
| ---------------- | --------- | --------------------------------------------------------- |
| `--surface-2`    | `#262238` | Elevated surfaces, hover, menus                           |
| `--text`         | `#ECE9F6` | Primary text                                              |
| `--text-2`       | `#A39FB8` | Secondary text (≈6.5:1 on `--surface`)                    |
| `--text-3`       | `#6F6A87` | Disabled/tertiary only (≈3.3:1; never for essential text) |
| `--accent-hover` | `#675B8C` | Primary button hover                                      |
| `--success`      | `#6FCF97` | Done, on track                                            |
| `--warning`      | `#E8B866` | At risk, overcommitted                                    |
| `--danger`       | `#E5707F` | Off track, destructive                                    |

Rules: use tokens, never hard-coded hex in components; focus ring is 2px `--highlight` with 2px offset; status is always icon + text + color; progress bars use `--muted` track and `--highlight` fill. Contrast of `--highlight` on `--bg` is ≈6.5:1 and of `--text` on `--accent` is ≈7:1; re-verify with a contrast tool when tokens change.

### 7.2 Typography

- **Plus Jakarta Sans** for all UI text. **IBM Plex Mono** for numbers, dates, times, durations, KR values, percentages, streak counts, keyboard hints, and any identifier. Use tabular numerals.
- Self-host via `@fontsource-variable/plus-jakarta-sans` and `@fontsource/ibm-plex-mono` (no external font requests; simpler CSP).
- Scale: 12 / 13 / 14 (body) / 16 / 20 / 24 / 32. Body is 14px, line height 1.5. Page titles 24px semibold. Dense table rows 36px high.

### 7.3 Layout and components

- 4px spacing grid; radii 6px (controls) and 10px (cards); 1px borders in `--border`; shadows minimal (menus and dialogs only).
- Desktop: 240px sidebar (collapses to 56px icons), content max-width 1200px, optional 320px right rail on Today.
- Component library: shadcn/ui on Radix, restyled to tokens; Lucide icons (1.5px stroke).
- Motion: 120–180ms ease-out; respect `prefers-reduced-motion`.
- Accessibility: visible focus everywhere, keyboard-operable dialogs and menus, labelled icon buttons, 44px minimum touch targets on mobile.

### 7.4 Entity cues

Distinguish entity types by icon, not extra colors: Life area (compass), Goal (flag), Objective (target), KR (gauge), Project (folder), Task (check-square), Habit (repeat), Review (notebook).

---

## 8. Technical architecture

### 8.1 Decision

A **Vite + React + TypeScript SPA** talking directly to **Supabase** (Auth + Postgres + RLS) from the browser using the publishable (anon) key, hosted as static assets on **Cloudflare**. No server code in MVP. A Cloudflare Worker is introduced only when Google Calendar sync, push delivery, or an AI gateway requires secrets and trusted jobs.

Why: this removes SSR, server session handling, and the Supabase-SSR/React-Router/Workers compatibility questions from the critical path, and RLS provides the security boundary.

### 8.2 Stack

| Layer            | Choice                                                                         |
| ---------------- | ------------------------------------------------------------------------------ |
| Language         | TypeScript (strict)                                                            |
| Build            | Vite, pnpm                                                                     |
| Lint & format    | Biome                                                                          |
| UI               | React; React Router (library/data mode, current stable)                        |
| Styling          | Tailwind CSS 4 with CSS-variable tokens                                        |
| Components       | shadcn/ui + Radix, Lucide icons                                                |
| Forms/validation | React Hook Form + Zod                                                          |
| Server state     | TanStack Query                                                                 |
| Backend          | Supabase Auth + Postgres + RLS; `@supabase/supabase-js`                        |
| Migrations       | Supabase CLI, SQL files in Git (schema source of truth); generated TS types    |
| Dates            | `date-fns` with `@date-fns/tz` (IANA zones), `Intl` for formatting             |
| Drag and drop    | `@dnd-kit` (Kanban and ordering)                                               |
| Charts           | Recharts (the three embedded views only)                                       |
| Fonts            | Plus Jakarta Sans and IBM Plex Mono via Fontsource                                       |
| Tests            | Vitest, Testing Library, Playwright, pgTAP or SQL-based RLS tests              |
| CI               | GitHub Actions                                                                 |
| Hosting          | Cloudflare static hosting (Pages or Workers static assets; confirm in Phase 0) |

**Not used in MVP:** Dexie/IndexedDB, Workers, Drizzle or any second data layer, message queues, service-role key in any client or hosted code.

### 8.3 Module structure (modular monolith inside the SPA)

```
src/
  app/            routes, providers, shell, guards
  features/       auth, settings, goals, okrs, projects, tasks, today, habits, reviews, export
    <feature>/    components/, hooks/, api/ (Supabase queries), schema.ts (Zod), index.ts
  domain/         pure, framework-free logic: kr-progress, health, streaks, capacity,
                  cycles, dates, task-rules  (100% unit-tested)
  lib/            supabase client, query client, formatters, errors, ids
  components/ui/  shadcn primitives restyled to tokens
supabase/
  migrations/     ordered SQL
  tests/          RLS and constraint tests
  seed.sql
scripts/          restore.ts, seed utilities (local only)
docs/             PRD.md, runbooks, restore procedure, schema notes
design/           Stitch exports and screenshots
```

Rules: features import from `domain`, `lib`, `components`; never from each other's internals. `domain` imports nothing from React or Supabase.

### 8.4 Authentication strategy

- Supabase Auth with email+password (email confirmation on) and Google provider.
- Session is managed by supabase-js (persisted, auto-refresh). A top-level auth provider exposes `session`, `user`, and `loading`; route guards render nothing private until `loading` is false.
- Because tokens live in browser storage, XSS is the main threat: strict CSP (self-hosted fonts and scripts, `connect-src` limited to the Supabase project origin), no `dangerouslySetInnerHTML`, sanitized Markdown rendering, dependency and secret scanning in CI.
- Configure Supabase **Site URL** and **redirect allow-list** for local, preview, and production origins.
- Google: create an OAuth client in Google Cloud; authorized redirect URI is the Supabase auth callback for the project; request only basic profile scopes.
- Supabase's built-in email sender is intended for light testing and has low hourly limits; **verify current limits** and set up a custom SMTP provider before relying on it for more than your own account.
- Never ship the service-role key. Restore and seed scripts run locally only.

### 8.5 Security headers

Served via the host's headers file: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`. SPA fallback to `index.html`.

### 8.6 Later architecture (post-MVP, for context only)

Add a **Cloudflare Worker** for Google Calendar OAuth/sync (encrypted refresh tokens, never client-readable), push delivery and scheduled jobs, and an optional AI gateway. Add **Dexie** as cache plus mutation outbox only after the online model is stable. PostgreSQL remains the canonical source of truth.

---

## 9. Data model (MVP)

Conventions for all tables: `id uuid primary key default gen_random_uuid()`; `workspace_id uuid not null` (except `profiles`, `workspaces`); `created_at`/`updated_at timestamptz default now()` with an `updated_at` trigger; enumerations as `text` with `CHECK` constraints (easier to migrate than native enums); instants are `timestamptz`, local days are `date`, measurements are `numeric`. Cross-workspace integrity is enforced with composite unique keys `(workspace_id, id)` and composite foreign keys `(workspace_id, x_id) → (workspace_id, id)`.

### 9.1 Identity

**`profiles`** — `id` (= `auth.users.id`, PK), `display_name`, `avatar_url`, `timezone` (IANA), `locale`, `currency_code`, `week_starts_on` (0–6), `working_days` (smallint[]), `working_hours` (jsonb, validated shape `{mon:{start,end},...}`), `onboarding_completed_at`.

**`workspaces`** — `id`, `owner_id` (→ profiles), `name`, `vision` (text), `created_at`, `updated_at`. Exactly one per owner in MVP (unique `owner_id`).

### 9.2 Outcomes

**`domains`** (life areas) — `name`, `color`, `icon`, `sort_order`, `archived_at`. Unique `(workspace_id, name)` among non-archived.

**`goals`** — `domain_id?`, `title`, `description`, `status`, `priority`, `start_date?`, `target_date?`, `archived_at`.

**`cycles`** — `name`, `cycle_type` (`monthly|quarterly|annual|custom`), `start_date`, `end_date`, `status` (`planned|active|closed`). Check `end_date >= start_date`.

**`objectives`** — `goal_id?`, `cycle_id`, `title`, `description`, `priority`, `status`, `confidence` (1–10, nullable), `start_date`, `due_date`, `archived_at`.

**`key_results`** — `objective_id`, `title`, `description`, `metric_type`, `baseline_value`, `current_value`, `target_value` (numeric), `unit`, `currency_code?`, `direction?`, `confidence?`, `start_date`, `due_date`. Checks: numeric KRs require direction and `target <> baseline`; direction/target consistency; binary values in {0,1}.

**`kr_check_ins`** — `key_result_id`, `value`, `raw_progress_percent`, `progress_percent` (clamped), `confidence?`, `notes`, `evidence_url?`, `supersedes_id?` (self FK), `recorded_by`, `recorded_at`. **No UPDATE or DELETE policies.**

### 9.3 Projects and tasks

**`projects`** — `domain_id?`, `title`, `description`, `status`, `priority`, `start_date?`, `due_date?`, `archived_at`.
**`project_objectives`** — `(project_id, objective_id)` composite PK, `workspace_id`.
**`project_key_results`** — `(project_id, key_result_id)` composite PK, `workspace_id`.
**`project_milestones`** — `project_id`, `title`, `status` (`open|done`), `due_date?`, `completed_at?`, `sort_order`.

**`tasks`** — `project_id?`, `key_result_id?`, `parent_task_id?` (one level enforced by trigger), `title`, `description`, `status`, `priority`, `planned_date?` (date), `planned_start_at?`, `planned_end_at?`, `due_date?` (date), `due_at?` (timestamptz), `estimated_minutes?`, `completed_at?`, `board_rank` (numeric, fractional ordering), `version` (int, default 1, incremented by trigger), `created_by`, `updated_by`, `deleted_at?`. Trigger sets/clears `completed_at` on status transitions.
**`labels`** — `name`, `color`. Unique `(workspace_id, lower(name))`.
**`task_labels`** — `(task_id, label_id)` composite PK, `workspace_id`.

### 9.4 Daily execution

**`daily_plans`** — `user_id`, `plan_date`, `capacity_minutes`, unique `(workspace_id, user_id, plan_date)`.
**`daily_plan_items`** — `daily_plan_id`, `task_id`, `rank` (numeric), `is_big_three`, `planned_start_at?`, `planned_end_at?`. Unique `(daily_plan_id, task_id)`. Trigger caps `is_big_three` at three per plan; check for non-overlapping blocks is done in an RPC/validation.
**`time_entries`** — `user_id`, `task_id?`, `started_at`, `duration_seconds`, `notes`, `source` (`manual`).

### 9.5 Habits and reviews

**`habits`** — `domain_id?`, `key_result_id?` (informational), `title`, `description`, `schedule_type` (`daily|weekdays|weekly_count`), `schedule_days` (smallint[]), `weekly_target?`, `target_value?`, `unit?`, `timezone`, `start_date`, `end_date?`, `status` (`active|paused|archived`).
**`habit_entries`** — `habit_id`, `entry_date`, `status` (`done|partial|skipped`), `actual_value?`, `notes`. Unique `(habit_id, entry_date)`.
**`reviews`** — `user_id`, `review_type` (`daily|weekly`), `period_start`, `period_end`, `template_version`, `answers` (jsonb, Zod-validated at the boundary, object-type check in SQL), `summary_snapshot` (jsonb), `status` (`draft|saved`). Unique `(workspace_id, user_id, review_type, period_start)`.

### 9.6 Indexes (initial)

`(workspace_id, status)` and `(workspace_id, planned_date)` and `(workspace_id, due_date)` on tasks (partial: `deleted_at is null`); `(workspace_id, project_id)`; `(key_result_id, recorded_at desc)` on check-ins; `(habit_id, entry_date)`; `(workspace_id, cycle_id)` on objectives; `(workspace_id, plan_date)` on daily plans. Add more only with measured need.

### 9.7 Database functions

- `handle_new_user()` — `SECURITY DEFINER`, fixed `search_path`, creates profile + workspace on `auth.users` insert.
- `is_workspace_owner(ws uuid)` — `STABLE`, `SECURITY DEFINER`, fixed `search_path`; used by policies.
- `kr_progress(baseline, current, target, direction, metric_type)` — `IMMUTABLE`, the single formula.
- `record_kr_check_in(...)` — atomic insert + current-value update (runs as invoker so RLS applies).
- Triggers: `updated_at`, task `version` and `completed_at`, Big Three cap, one-level subtask rule.

### 9.8 Deferred tables (not created in MVP)

`workspace_members`, `task_dependencies`, `task_recurrence_rules`, `notes`, `calendar_connections`, `external_events`, `push_subscriptions`, `notifications`, `ai_proposals`, `activity_logs`, `import_jobs`, offline outbox (client-side).

---

## 10. Row Level Security

**Principle:** every table in `public` has RLS enabled; no table is readable without an explicit policy; the browser only holds the anon key.

| Table                      | SELECT                             | INSERT               | UPDATE                       | DELETE   |
| -------------------------- | ---------------------------------- | -------------------- | ---------------------------- | -------- |
| `profiles`                 | `id = auth.uid()`                  | via trigger only     | own row                      | none     |
| `workspaces`               | `owner_id = auth.uid()`            | via trigger only     | owner                        | none     |
| `kr_check_ins`             | owner                              | owner (`WITH CHECK`) | **none**                     | **none** |
| All other workspace tables | `is_workspace_owner(workspace_id)` | same, `WITH CHECK`   | same, `USING` + `WITH CHECK` | same     |

Rules:

- Use `(select auth.uid())` inside policies for plan caching.
- `WITH CHECK` on every insert/update so a row cannot be moved into another workspace.
- Composite FKs make cross-workspace links impossible even if a policy is wrong.
- Helper functions use a fixed `search_path` and are granted only to `authenticated`.
- Future membership: replace the body of `is_workspace_owner` with a membership check; policies stay unchanged.
- **Test with real roles**, not by reading policies: two users, assert zero rows visible and failed writes across users, failed cross-workspace FK inserts, and no UPDATE/DELETE on check-ins.

---

## 11. Non-functional requirements

**Security & privacy:** RLS everywhere; secret scanning in CI; CSP; no secrets in the repo or bundles; generic auth errors; private review content never logged.
**Reliability:** exports and restore tested; failed requests show retry; mutations use TanStack Query with sensible retry and rollback on optimistic updates.
**Timezones:** instants UTC; user IANA timezone in profile; local planning dates as `DATE`; habit days and daily plans computed in the user's zone; tests for DST transitions and timezone changes; never assume server or browser zone equals the profile zone.
**Performance (measure, don't assume):** Today and Tasks interactive quickly on broadband; virtualize or paginate lists above ~200 rows; avoid N+1 by using joined selects or RPCs for Today and OKR summaries.
**Accessibility:** WCAG 2.2 AA target; keyboard-only operation of every flow; reduced motion; labelled icon buttons; status never by color alone.
**Browser support:** current evergreen Chrome, Firefox, Safari, Edge; iOS Safari and Android Chrome for mobile layouts.
**Free-tier reality:** Supabase free projects may pause when inactive and offer limited backup guarantees; Cloudflare free quotas apply. Treat the JSON export as the real backup, store one outside Supabase, and re-verify current limits at release.

---

## 12. Testing and CI

| Layer            | Coverage                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Unit (`domain/`) | KR progress (all directions and edge cases), health thresholds, cycle validation, streaks, capacity math, DST/date helpers |
| Database         | Constraints, triggers, RLS (two-user), composite FK rejection, check-in immutability, Big Three cap, subtask depth         |
| Component        | Forms, auth screens, task drawer, Kanban interactions                                                                      |
| E2E (Playwright) | First vertical slice, auth flows (email and mocked Google), plan a day, habit logging, weekly review                       |
| Export/restore   | Seed → export → restore into clean DB → compare counts and relationships                                                   |

CI on every PR: install (frozen lockfile) → typecheck → lint → format check → unit → database/RLS tests (local Supabase) → build → dependency and secret scan → E2E smoke. Preview deployments per PR; `main` deploys production; all schema changes are committed migrations.

Essential scenarios: user A cannot read/modify user B's data; cross-workspace FK rejected; task without project/KR is valid; objective without project is valid; check-in requires no task; a correction preserves history; KR progress at baseline/target/overshoot/regression; carry-over never changes dates silently; Big Three can't exceed three; habit missed vs skipped; streak across DST; export restores into a clean workspace.

---

## 13. Roadmap (maps 1:1 to the build prompts)

| Phase | Name                         | Outcome / exit criteria                                                                                          |
| ----- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 0     | Foundation                   | Repo, tooling, tokens/fonts, shell, Supabase wired, CI, deployed empty shell, no secrets in Git                  |
| 1     | Identity & workspace         | Email+password, Google, reset, provisioning trigger, RLS helpers, settings, onboarding; two-user RLS tests green |
| 2     | Goals & OKRs                 | Life areas, goals, cycles, objectives, KRs, check-ins, health; correct, auditable progress                       |
| 3     | Projects, tasks & **export** | Projects, milestones, tasks, Inbox, list, Kanban, undo, **JSON export + restore script**                         |
| 4     | Daily execution              | Today, Big Three, capacity, blocks, carry-over, time entries; user can plan and run a realistic day              |
| 5     | Habits & reflection          | Habits, streaks, daily/weekly reviews, embedded analytics                                                        |
| 6     | Hardening & release          | CSV export, mobile variants, PWA shell, E2E slice, security review, runbooks, restore test passed                |

Later phases (not scheduled): 7 Calendar + Worker, 8 Notifications/push, 9 Offline, 10 AI, 11 Advanced tasks, 12 Notes/search/command palette, 13 Import UI, 14 Themes and collaboration.

### 13.1 First vertical slice (P0 acceptance test)

Sign in → life area → goal → cycle → objective → KR → project → task → plan for today → complete → KR check-in → Today and Goals reflect it. Automate as the first Playwright test, finished by the end of Phase 4.

---

## 14. Post-MVP requirements (retained from the original doc, labeled Later)

These are intentionally not detailed to build level. They are preserved so MVP decisions do not block them.

**Google Calendar (read-only).** Separate consent from sign-in; narrowest read-only scope; Worker handles OAuth state/redirect validation, encrypts refresh tokens at rest (never in the client or client-readable tables), initial sync plus incremental sync tokens, full resync on HTTP 410, disconnect/revoke, bounded date windows. External events render read-only in Today and a Calendar view; conflict detection is deterministic.

**Notifications.** In-app first; browser push strictly opt-in after a user action; quiet hours and timezone respected; creation, scheduling, delivery, and read state are separate; idempotent delivery with retries.

**Offline.** Phased: PWA shell → offline task capture/edit with Dexie and a mutation outbox (`mutation_id`, `entity`, `operation`, `payload`, `base_version`, `retry_count`, `sync_status`) → cached reads → conflict UI. Idempotent server processing, version checks, tombstones, exponential backoff, never silently discard an edit. No CRDTs.

**AI (optional, approval-gated).** Provider interface (local OpenAI-compatible llama.cpp endpoint; external providers only when explicitly configured). AI produces _proposals_ (schedule, review draft, capture parsing) with rationale, assumptions, a stale-context hash, and expiry; the user accepts, edits, or rejects; approval revalidates state and applies transactionally with idempotency. Model output is untrusted and Zod-validated. The application, not the model, owns dates, conflicts, formulas, and permissions. No journal or financial data goes to external providers by default.

**Advanced tasks.** Dependencies with cycle prevention; constrained recurrence (daily/weekly/monthly, no claim of full RFC 5545); timer with overlap resolution; focus mode.

**Notes, search, command palette.** Markdown notes linked to entities; universal search over tasks, projects, goals, objectives, KRs, notes, reviews; `Ctrl/Cmd+K` palette with actions; `/` to search.

**Import.** JSON and CSV import with preview, duplicate handling, confirmation, and idempotent commit.

**Collaboration.** Add `workspace_members`, role-aware RLS (helper avoids recursion), invitations, shared projects.

---

## 15. Risks and mitigations

| Risk                                         | Mitigation                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| Scope creep                                  | MVP list in §4 is the contract; new ideas go to the Later epic           |
| RLS mistakes                                 | Two-user database tests in CI; composite FKs as a second line of defense |
| Free-tier pause or limits change             | Export early (Phase 3), restore test, one off-platform export            |
| Email deliverability for verification        | Plan custom SMTP before inviting others                                  |
| Timezone/DST bugs                            | IANA zones, `DATE` for local days, DST tests                             |
| Dashboard overload                           | Today layout fixed to the priority order in §5.8                         |
| Progress that lies                           | Task completion never changes KR values; health derived from KRs only    |
| Token theft via XSS (browser-stored session) | CSP, no raw HTML, dependency scanning                                    |
| Agent-generated code drift                   | `AGENTS.md` rules, per-phase exit criteria, tests before moving on       |

---

## 16. Decisions register

| Decision        | Choice                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------- |
| Audience        | Personal use first, public-ready later                                                    |
| Frontend        | Vite + React SPA, no SSR                                                                  |
| Backend         | Supabase only in MVP; Worker added with Calendar                                          |
| Auth            | Email+password (verification, reset) and Google; no magic link; Calendar consent separate |
| Workspace       | One per account; owner-only RLS; membership deferred                                      |
| Home            | Today                                                                                     |
| Cycles          | Monthly, Quarterly, Annual, Custom                                                        |
| KR types        | Numeric, Binary (percent/currency are numeric)                                            |
| Health          | Derived from progress vs elapsed time; confidence is separate user input                  |
| Check-ins       | Append-only with corrections via `supersedes_id`                                          |
| Subtasks        | One level                                                                                 |
| Time tracking   | Manual only                                                                               |
| Habit missed    | Derived; partial is neutral for streaks                                                   |
| Theme           | Dark only in MVP; semantic tokens                                                         |
| Fonts           | Plus Jakarta Sans + IBM Plex Mono                                                                   |
| Locale/currency | Configurable, default from locale                                                         |
| Backups         | Full JSON export + tested restore from Phase 3                                            |
| ORM             | None; Supabase client + SQL migrations                                                    |

---

## 17. MVP definition of done

- [ ] Email+password (verified, resettable) and Google sign-in work; each account gets one isolated workspace.
- [ ] Two-user RLS tests, cross-workspace FK tests, and check-in immutability tests pass in CI.
- [ ] User can create life areas, goals, cycles, objectives, KRs; progress and health are correct and tested at boundaries.
- [ ] Check-in history is append-only; corrections preserve history.
- [ ] User can capture to Inbox, organize tasks with subtasks and labels, and use list and Kanban views with undo.
- [ ] Today supports Big Three, capacity, time blocks, carry-over, and manual time entries.
- [ ] Habits track independently with correct streaks and derived missed days.
- [ ] Daily and weekly reviews work with deterministic summaries.
- [ ] First vertical slice passes as an automated E2E test.
- [ ] JSON export restores into a clean workspace (tested); CSV exports available.
- [ ] Mobile variants for Today, Inbox, Habits are usable; PWA shell installs.
- [ ] Dark theme uses tokens only; Plus Jakarta Sans/Mono self-hosted; accessibility checks pass.
- [ ] Core workflows require no AI and no Calendar.
- [ ] README, runbooks (deploy, restore, rotate keys), and `AGENTS.md` are current.

---

## Appendix A — Verify before release (provider facts change)

Supabase free-tier limits, inactivity pause, and email-sending limits; Supabase identity-linking behavior; Cloudflare static hosting recommendation and quotas; Google OAuth consent screen status and any verification requirement; `@date-fns/tz` and library versions at install time (pin exact versions and commit the lockfile).
