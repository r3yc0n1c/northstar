# Deployment & Hosting Guide — Northstar

## 1. Hosting Architecture Decision: Cloudflare Pages vs Workers Static Assets

For Phase 0 and MVP, **Cloudflare Pages** is the recommended and selected deployment target.

### Evaluation Summary

| Dimension | Cloudflare Pages | Cloudflare Workers Static Assets |
| :--- | :--- | :--- |
| **Use Case Fit** | Native static SPA hosting | Edge serverless runtime + static assets |
| **Complexity** | Zero configuration; `_headers` and `_redirects` handled natively | Requires `wrangler.jsonc` and worker asset bindings |
| **PR Previews** | Automatic per-PR preview URLs with branch isolation | Requires custom Wrangler CI script & environment config |
| **Local Tooling** | Static preview via Vite (`pnpm dev`, `pnpm build`) | Requires Workerd native binary build approval |
| **MVP Alignment** | 100% aligned with PRD §8.1 (no server code in MVP) | Premature complexity until Calendar Worker phase |

### Rationale
Per PRD §8.1, Northstar is a static SPA running client-side with Supabase as the backend (Auth, Postgres, RLS). Cloudflare Pages provides immediate zero-maintenance global static CDN distribution, atomic deployments, automatic PR previews, and native support for `_headers` and `_redirects`. When Google Calendar sync and push notifications arrive in Phase 7 (PRD §8.6), a dedicated Cloudflare Worker will be paired with the application.

---

## 2. Security Headers & CSP Explanation

Northstar enforces a strict Content Security Policy (CSP) and defense-in-depth HTTP headers via `public/_headers`, copied into `dist/_headers` at build time.

```http
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co http://127.0.0.1:54321; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

### Directives & Documentation

1. **`default-src 'self'`**: Restricts all resource loads to Northstar's origin by default.
2. **`script-src 'self'`**: No external script execution, preventing third-party script injection.
3. **`style-src 'self' 'unsafe-inline'`**:
   - **Why `'unsafe-inline'` is required**: In a purely client-side SPA (no SSR edge runtime), dynamic CSS custom properties (tokens), Tailwind 4 compilation, and Radix UI position calculation transforms require inline style attributes. Without an SSR server to generate dynamic per-request nonces, `'unsafe-inline'` is required for styling functionality.
4. **`font-src 'self'`**: All fonts (Plus Jakarta Sans and IBM Plex Mono) are self-hosted via Fontsource. Zero runtime external requests to Google Fonts or CDNs.
5. **`img-src 'self' data: https:`**: Permits local assets, SVG data URIs, and HTTPS avatar images.
6. **`connect-src 'self' https://*.supabase.co http://127.0.0.1:54321`**: Restricts network calls (Fetch, WebSocket, Auth) strictly to self and the Supabase API.
7. **`frame-ancestors 'none'`**: Disallows embedding Northstar in iframes on any domain, eliminating clickjacking risks.
8. **`X-Content-Type-Options: nosniff`**: Prevents browser MIME-type sniffing.
9. **`Referrer-Policy: strict-origin-when-cross-origin`**: Limits referrer leakage to origins on secure cross-origin requests.

---

## 3. SPA Fallback Routing

Client-side routing is handled via `public/_redirects`:

```
/*    /index.html   200
```

Cloudflare Pages uses this rewrite rule to route all navigation requests (e.g., `/today`, `/inbox`, `/dev/kitchen-sink`) to `index.html` with an HTTP 200 status code.

---

## 4. CI/CD Pipeline & GitHub Actions

The CI/CD workflow defined in `.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

1. **Install dependencies**: `pnpm install --frozen-lockfile`
2. **Typecheck**: `pnpm typecheck`
3. **Lint**: `pnpm lint` (Biome)
4. **Format verification**: `pnpm format:check` (Biome)
5. **Unit tests**: `pnpm test` (Vitest)
6. **Database test harness**: `pnpm test:db`
7. **Production build**: `pnpm build`
8. **Dependency audit**: `pnpm audit --prod`
9. **Secret scanning**: Gitleaks action scans the commit history to ensure zero secrets or service-role keys are committed.
10. **Deployment to Cloudflare Pages**:
    - Uses `cloudflare/wrangler-action@v4` running `pages deploy dist --project-name=northstar`.
    - On PR: Deploys an isolated preview build with a unique URL.
    - On `main` merge: Deploys directly to production.

### Required Repository Secrets (for Cloudflare deployment)
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with `Cloudflare Pages:Edit` permission.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
