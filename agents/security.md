# Security Rules

Purpose: protect user sessions, verification flows, cross-app redirects, and sensitive account state.

## Token Storage

- Never store tokens in `localStorage`.
- Production credentials must move through server-owned `HttpOnly`, `Secure`, parent-domain cookies.
- JavaScript-readable auth cookies are development compatibility only and must stay disabled in production unless explicitly allowed for a controlled migration.
- `session_active` is a non-sensitive hint, not proof of authentication.

## Session Validation

- Protected UI must validate session through local route handlers or trusted recovery helpers.
- Do not treat Zustand state alone as authorization.
- Logout must call local `/api/logout` so shared parent-domain cookies are cleared before redirecting to login.

## Redirect Safety

- Validate external `next` URLs by exact allowed origins.
- Never use prefix checks for external returns.
- `/logout` must never be preserved as a post-login `next` destination.
- Invalid or foreign redirects must fall back to `/dashboard`.

## Verification Safety

- Limited-token users can complete only the intended verification flow.
- Identity verification must not leak NID, PID, biometric, engine, or internal failure details.
- Camera errors should be user-safe and should not expose internal engine responses.

## UI Data Safety

- Do not render refresh tokens, access tokens, raw verification payloads, NID, PID, or private signing material.
- User activity pages are read-only and must not offer destructive controls.
- Settings defaults are preferences only; backend services still enforce final permission and verification rules.
