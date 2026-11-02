# Northstar

> Turn what matters into measurable outcomes, realistic plans, and consistent daily action.

Northstar is a personal operating system connecting long-term direction to everyday execution: life areas → goals → OKRs → projects → tasks → daily planning → habits → reviews.

---

## Stack (MVP)

- **Frontend:** Vite + React 19 + TypeScript (strict mode with `noUncheckedIndexedAccess`).
- **Styling:** Tailwind CSS 4 with CSS variables as tokens in `src/styles/tokens.css`.
- **UI Components:** Restyled shadcn/ui primitives on Radix UI; Lucide icons.
- **Linter & Formatter:** Biome (high-performance linting and formatting).
- **Backend:** Supabase (Auth, Postgres, Row-Level Security) using `@supabase/supabase-js`.
- **Fonts:** Self-hosted Plus Jakarta Sans and IBM Plex Mono via Fontsource.
- **Testing:** Vitest, Testing Library, and Playwright.
- **Hosting:** Cloudflare Pages (static SPA with defense-in-depth CSP and security headers).

---

## Getting Started

### Prerequisites

- **Node.js:** v22.0.0 or higher
- **Package Manager:** `pnpm` (v12.x or higher)

### Setup

```bash
# Clone the repository
git clone https://github.com/r3yc0n1c/northstar.git
cd northstar

# Install dependencies (frozen lockfile)
pnpm install

# Copy environment variables
cp .env.example .env

# Run local development server
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start Vite local development server |
| `pnpm build` | Compile TypeScript and bundle production static assets to `dist/` |
| `pnpm typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `pnpm lint` | Run Biome linter across the codebase |
| `pnpm format` | Automatically format all source files with Biome |
| `pnpm format:check` | Check source files formatting with Biome |
| `pnpm test` | Run domain and UI unit tests with Vitest |
| `pnpm test:db` | Run database and RLS test harness |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm check` | Run full pre-commit verification suite (`typecheck + lint + format:check + test + test:db`) |
| `pnpm db:reset` | Reset local Supabase database (`supabase db reset`) |
| `pnpm db:types` | Regenerate TypeScript database types (`supabase gen types`) |

---

## Environment Variables

Northstar uses only the publishable anon key on the client. Never commit or expose the service-role key:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

---

## Design System & Kitchen Sink

In development mode, visit [`/dev/kitchen-sink`](http://localhost:5173/dev/kitchen-sink) to inspect all design tokens, typography, shadcn/ui primitives, and shared UI patterns in all states.

- **Tokens:** Defined exclusively in `src/styles/tokens.css` (no raw hex codes in components).
- **Numerals:** Tabular numbers with `.font-mono-num` in IBM Plex Mono.
- **Focus Rings:** 2px `--highlight` with 2px offset.

---

## Deployment & Security

Deployments are automated through GitHub Actions to Cloudflare Pages. Defense-in-depth security headers and strict CSP are configured via `public/_headers`. For comprehensive deployment architecture details, consult [docs/deploy.md](docs/deploy.md).
