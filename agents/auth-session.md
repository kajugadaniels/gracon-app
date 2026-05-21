# Auth And Session Rules

Purpose: keep login, refresh, logout, limited-token, and cross-app authentication predictable.

## Ownership

- `api/auth` issues credentials.
- `app/app` presents auth UI and uses local route handlers for browser-safe session operations.
- Other apps may redirect to `app/app` for login or identity verification, but this app must not own their business rules.

## Login

- Login must preserve safe `next` values only.
- Cross-app redirects must use hard navigation.
- Failed login states should use shared toast/error UI and never reveal internal auth reasons.

## Refresh And Recovery

- AuthProvider should restore active cookie-backed sessions through local `/api/me`.
- Axios/API recovery should retry expired access tokens once.
- Do not add another refresh loop or duplicate token store.
- Session recovery changes must be tested with route refresh, expired access token, and invalid refresh token cases.

## Logout

- Logout must flow through `/api/logout`.
- Shared cookies should be cleared for every configured Gracon domain in production.
- After logout, redirect to login without preserving `/logout` as `next`.

## Environment Rules

- Keep `.env.example` current for cookie domain, secure flag, same-site policy, redirect origins, docs/meetings URLs, access TTL, and refresh TTL.
- Production must use secure parent-domain cookies such as `.gracon360.com`.
- Development must keep the existing compatibility path intact.
