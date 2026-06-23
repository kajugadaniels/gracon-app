# app/app Security

`app/app` is the identity frontend. It owns login, onboarding, account recovery,
profile/settings, identity verification UI, and the cross-app login entry point
for documents and meetings.

## Session Boundary

- `api/auth` issues credentials; this app only presents session UX and calls
  local route handlers for browser-safe recovery, refresh, and logout.
- Production credentials must use `HttpOnly`, `Secure`, parent-domain cookies.
- JavaScript-readable auth cookies are development compatibility only and must
  stay disabled in production.
- `session_active` is only a non-sensitive hint. It must never be treated as
  proof of authentication without server validation.
- Keep `sessionStorage` token persistence transitional and scoped to documented
  auth helpers while the server-owned cookie migration remains active.

## Redirect Safety

- Login and verification `next` values must use exact-origin allowlisting.
- Prefix checks are not allowed for external redirects.
- `/logout` must never be preserved as a post-login destination.
- Unsafe or foreign redirects must fall back to `/dashboard`.

## Sensitive Data

- Never render access tokens, refresh tokens, raw verification payloads, NID,
  PID, biometric payloads, or private signing material.
- Do not log credentials or verification internals to the browser console.
- Camera and verification errors must stay user-safe and must not expose engine
  or backend internals.

## Required Checks

```bash
npm run check:security
npm run lint
npm run test
npm run build
npm audit --audit-level=high
```

Run deployment env validation with real production env values before release:

```bash
CHECK_DEPLOY_ENV=true npm run check:security
```
