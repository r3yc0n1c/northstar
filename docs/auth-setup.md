# Authentication & Identity Linking Setup — Northstar

This document details the configuration, security constraints, and identity linking behavior for Google OAuth and Email/Password authentication in Northstar per PRD §5.1 (**FR-AUTH-4**, **FR-AUTH-6**, **FR-AUTH-9**).

---

## 1. Google OAuth Provider Configuration

### 1.1 Scope Boundaries (Strict Zero-Calendar Rule)
Per **FR-AUTH-4**, Google authentication requests **only** the basic OpenID Connect scopes:
```text
openid email profile
```
> [!IMPORTANT]
> **No Calendar scopes** (`calendar.readonly`, `calendar.events`, etc.) are requested during authentication or in Phase 1. Google Calendar integration is strictly separated and deferred to Phase 4 (Worker sync), where it requires an independent, later OAuth consent screen per PRD §14.

### 1.2 Google Cloud Console Configuration
1. **OAuth Consent Screen**:
   - User Type: External
   - App Name: `Northstar`
   - User support email: `support@northstar.app`
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
2. **Authorized JavaScript Origins**:
   - Local: `http://localhost:5173`, `http://127.0.0.1:5173`
   - Supabase Local: `http://127.0.0.1:54321`
   - Cloudflare Preview: `https://*.northstar.pages.dev`
   - Production: `https://app.northstar.com`
3. **Authorized Redirect URIs**:
   - Supabase Auth Callback: `<SUPABASE_PROJECT_URL>/auth/v1/callback`
   - Local Dev: `http://127.0.0.1:54321/auth/v1/callback`

### 1.3 Supabase Auth Redirect Allow-List
In `supabase/config.toml` (and Supabase Cloud Dashboard under Authentication > URL Configuration):
- **Site URL**: `http://localhost:5173`
- **Additional Redirect URLs**:
  - `http://localhost:5173/**`
  - `http://127.0.0.1:5173/**`
  - `https://*.northstar.pages.dev/**`
  - `https://app.northstar.com/**`

---

## 2. Auto-Provisioning Guarantee (FR-AUTH-9)

Regardless of the authentication provider (Email/Password or Google OAuth), provisioning is handled **entirely in PostgreSQL** via the `handle_new_user()` trigger on `auth.users`:

```sql
-- Executed on INSERT into auth.users (SECURITY DEFINER, search_path = '')
INSERT INTO public.profiles (id, email, display_name)
VALUES (
  NEW.id,
  NEW.email,
  COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
);

INSERT INTO public.workspaces (name, owner_id)
VALUES ('Personal', NEW.id);
```

### Invariants:
- Exactly **one profile** and **one personal workspace** are created per user.
- Client code never provisions workspaces or profiles.
- Trigger runs with `SECURITY DEFINER` and fixed `search_path = ''`.

---

## 3. Identity Linking Matrix (FR-AUTH-6)

Supabase GoTrue supports automatic and explicit account linking when the same email is utilized across providers, conditioned on email verification status:

| Scenario | Initial State | Second Action | Outcome | Security Invariant |
| :--- | :--- | :--- | :--- | :--- |
| **A: Password $\rightarrow$ Google (Verified)** | User signs up with email+password and confirms email (`email_confirmed_at IS NOT NULL`). | User clicks "Continue with Google" with identical email. | **Identities link automatically**. Supabase attaches the Google identity to existing `auth.users.id`. Single profile and workspace preserved. | No duplicate rows created. User retains existing data. |
| **B: Password $\rightarrow$ Google (Unverified)** | User signs up with email+password but has **not** confirmed email (`email_confirmed_at IS NULL`). | User clicks "Continue with Google" with identical email. | **Linking rejected / confirmation required**. GoTrue prevents account linking until the original email ownership is proven. | **Prevents account takeover**: An attacker cannot preemptively register an email to hijack a legitimate Google user. |
| **C: Google $\rightarrow$ Password** | User signs in via Google OAuth (`email_confirmed_at` is set automatically by Google). | User signs up with email+password using identical email. | GoTrue links the password provider to the existing verified user or requests password establishment. | Same `auth.users.id` maintained; exactly one profile and one workspace remain. |

---

## 4. Verification & Testing

### Running Auth Tests
```bash
# Unit and component tests (API layer, forms, route guards)
pnpm test src/features/auth

# Database schema, trigger, and RLS validation
pnpm test:db
```

### Local Manual Verification Checklist
1. **Google OAuth Button**:
   - Visit `/auth/sign-in` and `/auth/sign-up`.
   - Verify "Continue with Google" renders with accessible labels and responds to click events.
2. **Local Supabase Auth Callback**:
   - Ensure `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` are provided in `.env.local` if testing live OAuth tokens locally.
   - Without live credentials, mock tests in `src/features/auth/api/auth.test.ts` verify scopes and redirect payload integrity.
