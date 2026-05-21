# Folder Structure Rules

Purpose: define where identity-app frontend files belong so auth, verification, profile, signature, and settings surfaces remain maintainable.

## Current Layout

```text
app/app/
  agents/                  AI-agent project rules
  src/
    app/
      (auth)/              login, register, verify-email, forgot/reset-password
      (protected)/         dashboard, settings, profile redirect, signature, verify-identity
      api/                 local session, refresh, logout route handlers
      logout/              shared-cookie logout handoff route
      verify/              public document authenticity page
    api/                   browser/API client wrappers for backend services
    components/
      pages/               route-level page components
      settings/            settings layout and panels
      shared/              app shell, topbar, route recovery
      ui/                  primitive UI components
    constants/             navigation and static app constants
    lib/
      auth/                session recovery, redirect safety, cookie policy helpers
      hooks/               route title and shared client hooks
      store/               Zustand auth/session state
  test/                    regression tests
```

## Placement Rules

- Put App Router route files under `src/app`.
- Put large route UI in `src/components/pages/<surface>/`.
- Put settings-specific UI in `src/components/settings/`.
- Put shared navigation, loading, topbar, and recovery UI in `src/components/shared/`.
- Put reusable primitives such as toast/loading states in `src/components/ui/`.
- Put API wrappers in `src/api/<domain>/`.
- Put cross-app redirect, cookie, and session helpers in `src/lib/auth/`.
- Put client-only route title logic in `src/lib/hooks/`.

## New Route Rules

- Add metadata titles for server routes.
- Use `usePageTitle` for client-only protected pages.
- Add or update route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` for high-risk surfaces.
- Update middleware/proxy route handling when route visibility changes.
