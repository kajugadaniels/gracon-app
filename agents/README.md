# App App Agent Guide

Purpose: this directory gives AI agents project-local rules for working on the Gracon identity frontend without weakening auth/session handling, identity verification, cross-app redirects, signature setup, settings defaults, or responsive UI quality.

Read this file first, then read the topic file that matches the change.

## Reading Order

1. `folder-structure.md` - where new routes, components, clients, and helpers belong.
2. `file-structure.md` - naming, comments, exported APIs, and module CSS expectations.
3. `security.md` - token storage, session recovery, redirect allowlists, and verification safety.
4. `auth-session.md` - login, logout, refresh, limited-token, and cross-app cookie rules.
5. `verification-routing.md` - identity verification, external `next` URLs, and return flows.
6. `ui-design.md` - topbar, settings, loading, responsive, and CSS-module rules.
7. `testing.md` - required test shape and priority areas.
8. `documentation.md` - when README, `.env.example`, and route docs must change.
9. `git.md` - copy-paste commit format for this app.

## App Boundary

`app/app` owns Gracon account onboarding, login, email verification, password reset, profile, identity verification, digital-signature setup UI, settings defaults, user activity display, and cross-app auth entry points.

It must not absorb document-editor business logic, meeting-room business logic, admin control-plane behavior, or backend-only verification decisions.

## Conflict Rule

If a local rule here conflicts with root `AGENTS.md`, follow the stricter security rule and update documentation after the decision is made.
