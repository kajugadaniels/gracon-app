# Testing Rules

Purpose: protect auth, verification, redirect, settings, and session behavior from regressions.

## Commands

```bash
npm run test
npm run build
npm run lint
```

Use the smallest command that proves the change. For docs-only changes, no build is required.

## Priority Areas

1. Redirect safety: unsafe `next` rejection, exact-origin allowlist behavior, logout path rejection.
2. Session recovery: active cookie recovery, expired token retry, refresh failure cleanup.
3. Identity verification routing: default dashboard return and safe external returns.
4. Token cleanup helpers: logout and invalid-session cleanup.
5. Settings defaults: no-extra-verification disables stricter defaults and saved values hydrate correctly.
6. User activity: pagination, filtering, ordering, and read-only behavior.

## UI Testing

- Verify responsive behavior at mobile, tablet, laptop, and desktop breakpoints.
- Check loading, empty, error, and success states.
- For local frontend design changes, open the relevant localhost page and inspect the actual UI when practical.
