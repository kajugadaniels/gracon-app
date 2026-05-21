# Documentation Rules

Purpose: keep identity-app behavior clear for future contributors.

## Update Documentation When

- Auth/session recovery behavior changes.
- Cookie strategy or environment variables change.
- Cross-app redirect allowlists change.
- Identity verification routing changes.
- Settings defaults or user activity behavior changes.
- Navigation or protected shell architecture changes.
- Loading/recovery component patterns change.

## Required Places

- `app/app/README.md` for app-local architecture and rules.
- `app/app/.env.example` for new configuration.
- Root `AGENTS.md` only when cross-project platform architecture changes.
- Backend README files when frontend changes require backend contract changes.

## Documentation Quality

- Describe the user flow and the security reason.
- Mention development vs production behavior when cookie or redirect behavior differs.
- Keep docs concise but precise enough for another agent to work safely.
