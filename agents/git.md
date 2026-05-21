# Git Rules

Purpose: keep identity-app commits reviewable and copy-paste safe.

Codex must never run git commands automatically. Present commands only.

## Required Format

Paths are relative to `app/app/`, where this app `package.json` lives.

```bash
git add "src/components/shared/Navbar.tsx"
git commit -m "feat(shared): add account menu settings link"
```

## Rules

- One file per `git add`.
- Always quote paths.
- Never use `git add .` or `git add -A`.
- Never include `cd app/app`.
- Never run `git push`.
- Use Conventional Commits.

## Common Scopes

- `auth` - login, logout, refresh, session recovery.
- `verification` - identity verification UI/routing.
- `signature` - digital-signature setup UI.
- `settings` - workspace settings, profile settings, user activity.
- `profile` - profile/account pages.
- `shared` - navbar, layout, recovery UI.
- `ui` - primitive UI components.
- `middleware` - proxy/middleware route behavior.
- `docs` - README and agent docs.
