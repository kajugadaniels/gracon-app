# App App

Primary user-facing frontend for the Gracon platform.

This application handles account onboarding, login, email verification, password reset, profile management, identity verification, digital-signature setup, and general account/dashboard surfaces. It is also the identity gateway that `app/documents` redirects to when a user needs to authenticate or complete verification.

## Overview

- Runtime: Next.js 16.2.1 + React 19 + TypeScript
- Default port: `4000`
- Styling: Tailwind CSS
- State: Zustand + sessionStorage
- Forms: React Hook Form + Zod
- Media capture: browser camera flow for identity verification
- Browser titles: each route should use the `"{page name} | Gracon 360"` convention

## What This App Owns

- Login, register, verify-email, forgot/reset-password
- Protected dashboard and profile pages
- Identity verification UI
- Signature-key setup UI with certificate request states for pending, approved, rejected, and cancelled review outcomes
- Background certificate-state refresh while requests are pending or newly approved
- Persistent certificate sanction banners showing revocation or access restriction reasons returned by `api/signature`
- Public document verification page
- Shared-login entry point for the documents app

## Core Skills Needed

- Next.js App Router and middleware
- Secure token/session handling in frontend apps
- Camera and multipart verification UX
- Profile/account UX patterns
- Cross-origin handoff between related web apps

## Techniques Used

- Zustand in-memory auth store with sessionStorage hydration
- `session_active` cookie as middleware signal, not as token container
- AuthProvider restores active cookie-backed sessions through local `/api/me` before protected routes redirect to login
- Axios auth recovery uses one retry for expired access tokens and can upgrade limited sessions through `/auth/session/upgrade` when identity verification is required
- Cross-app auth is moving to a server-owned cookie contract. Production must rely on `HttpOnly`, `Secure`, parent-domain cookies for real credentials; JavaScript-readable `g360_at`/`g360_rt` cookies are development compatibility only and are blocked in production unless explicitly enabled.
- `session_active` remains a non-sensitive session hint only. It must never be treated as proof of authentication without server validation.
- Cross-app redirect handling for `app/documents` return flows uses exact-origin allowlisting. Never use prefix checks for external return URLs.
- Limited-token vs full-token user journeys
- Personal-account onboarding sends users from email verification directly into identity verification with a temporary limited session, then returns them to login after identity verification passes
- Verification routing only allows external returns to the configured documents origin; invalid or foreign `next` values fall back to `/dashboard`
- Local verification component stack in `src/components/pages/verification/shared`
- Silent refresh through Next.js route handlers
- Local `/api/me`, `/api/refresh`, and `/api/logout` route handlers are the transition point toward server-owned sessions. In production they keep refresh credentials in `HttpOnly` cookies; development can still opt into the previous readable-cookie path.
- Logout must flow through local `/api/logout` first so parent-domain session cookies are cleared for every Gracon subdomain before the user is returned to login.
- Shared `AppLoadingState` keeps auth/session, profile, logout, and digital-signature loading states visually consistent while `PremiumLoader` remains for small button-level spinners
- Route-level loading, error, and not-found recovery screens are defined for root, auth, protected workspace, digital-signature setup, identity verification, and public signature verification surfaces
- Regression tests cover verification routing, auth session recovery, identity-verification redirects, and token cleanup helpers
- Root metadata owns the `"%s | Gracon 360"` title template; client-only protected pages use `usePageTitle`
- Digital-signature setup loads key-pair, certificate, request status, sanction status, and signature image together; pending or newly approved certificate state refreshes in the background
- High-risk route styling is moving out of `globals.css` and inline objects into scoped CSS modules; protected layout, auth layout, profile page, digital-signature page, identity-verification page, public signature verification, and shared sidebar/navbar chrome now own their styles locally

## Main Areas

```text
src/app/
  (auth)/         login, register, verify-email, forgot/reset-password
  (protected)/    dashboard, profile, verify-identity
  api/            local refresh and current-user handlers
  verify/         public document-authenticity page
components/
  pages/
    auth/
    profile/
    signature/
    verification/
    verify/
  shared/
  ui/            shared primitives, including AppLoadingState for page/surface loading
api/
  auth/
  users/
  verification/
  signature/
lib/
  store/
  hooks/
    usePageTitle.ts title helper for client-only pages
```

## Folder Structure

```text
app/app/
  src/
    app/
    api/
    components/
    lib/
    constants/
  public/
  test/
  package.json
```

## Local Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
```

## Environment Notes

Key variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SIGNATURE_API_URL=http://localhost:3002/api/v1
NEXT_PUBLIC_DOCS_URL=http://localhost:4002
NEXT_PUBLIC_AUTH_ALLOWED_REDIRECT_ORIGINS=http://localhost:4002
AUTH_ALLOWED_REDIRECT_ORIGINS=http://localhost:4002
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
AUTH_ACCESS_TOKEN_TTL=15m
AUTH_REFRESH_TOKEN_TTL=1d
AUTH_REFRESH_ROTATION=true
AUTH_REUSE_DETECTION=true
ALLOW_DEV_READABLE_AUTH_COOKIES=true
```

For production, use a parent domain such as `.gracon360.com`, set
`AUTH_COOKIE_SECURE=true`, and leave `ALLOW_DEV_READABLE_AUTH_COOKIES=false`.
Access tokens should stay short-lived. Refresh tokens may use a one-day lifetime,
but should rotate on every refresh and reject reuse server-side.

## Integration Boundaries

- Calls `api/auth` and `api/signature`
- Acts as the login/verification destination for `app/documents`
- Must not absorb document-editor business logic

## Important Rules

- Keep tokens out of `localStorage`
- Production must not write refresh tokens to JavaScript-readable storage or cookies. During the migration, `sessionStorage` remains for the current API client, but cross-app authentication must move toward `HttpOnly` server-managed cookies.
- Keep the development auth path intact. Local development may use `NEXT_PUBLIC_ALLOW_DEV_READABLE_AUTH_COOKIES=true`; production must disable it and rely on the server-cookie route handlers.
- Do not add new auth persistence paths without checking `AuthProvider`, `auth.store.ts`, and `api/auth/session-recovery.ts` together.
- Use hard navigation for cross-origin jumps back to `app/documents`
- Validate cross-app `next` values with exact origins only. Lookalike domains such as `documents.gracon360.com.evil.test` must fall back to `/dashboard`.
- Preserve the distinction between full-token and limited-token experiences
- Keep verification logic local to this app now that the shared package has been rolled back
- Use `AppLoadingState` for page and panel loading. Avoid adding new inline full-page spinner wrappers.
- Add or update route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` when introducing high-risk route segments. Use `RouteRecoveryState` for lightweight retry and navigation recovery UI.
- Keep browser titles consistent. Server routes should set metadata titles without the suffix; client-only routes should use `usePageTitle`.
- Keep verification redirects constrained. Only the configured `NEXT_PUBLIC_DOCS_URL` origin should be allowed for external return URLs.
- Keep digital-signature setup state explicit. Certificate request, active certificate, sanction status, and signature image should remain separate UI states.
- Prefer scoped CSS modules for new layout/page refactors. `globals.css` should stay limited to tokens, shared primitives, animations, and truly global shell behavior.
- Keep route-level layout styles beside their routes in `.module.css` files. Avoid adding new page-shell, header, banner, or loading wrapper styles to `globals.css`.

## Contribution Checklist

- Update middleware when adding new public routes
- Keep auth recovery and redirect behavior explicit
- Test verification, login, and return-to-documents flows after auth changes
- Run the auth/session regression tests after touching `session-recovery.ts`, redirect handling, token storage keys, or identity-verification routing.
- Test limited-token upgrade and identity-verification return flows after session changes
- Test certificate pending, approved, rejected, cancelled, revoked, and restricted states after signature changes
- Keep `README.md` updated when changing auth/session recovery, loading UI, verification routing, or signature setup behavior
