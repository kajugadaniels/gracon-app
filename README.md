# App App

Primary user-facing frontend for the Gracon platform.

This application handles account onboarding, login, email verification, password reset, profile management, identity verification, digital-signature setup, and general account/dashboard surfaces. It is also the identity gateway that `app/documents` redirects to when a user needs to authenticate or complete verification.

## Overview

- Runtime: Next.js 15 + React + TypeScript
- Default port: `4000`
- Styling: Tailwind CSS
- State: Zustand + sessionStorage
- Forms: React Hook Form + Zod
- Media capture: browser camera flow for identity verification

## What This App Owns

- Login, register, verify-email, forgot/reset-password
- Protected dashboard and profile pages
- Identity verification UI
- Signature-key setup UI with certificate request states for pending, approved, rejected, and cancelled review outcomes
- Background certificate-state refresh while requests are pending or newly approved
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
- Cross-app redirect handling for `app/documents` return flows
- Limited-token vs full-token user journeys
- Local verification component stack in `src/components/pages/verification/shared`
- Silent refresh through Next.js route handlers

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
  ui/
api/
  auth/
  users/
  verification/
  signature/
lib/
  store/
  hooks/
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
```

## Integration Boundaries

- Calls `api/auth` and `api/signature`
- Acts as the login/verification destination for `app/documents`
- Must not absorb document-editor business logic

## Important Rules

- Keep tokens out of `localStorage`
- Use hard navigation for cross-origin jumps back to `app/documents`
- Preserve the distinction between full-token and limited-token experiences
- Keep verification logic local to this app now that the shared package has been rolled back

## Contribution Checklist

- Update middleware when adding new public routes
- Keep auth recovery and redirect behavior explicit
- Test verification, login, and return-to-documents flows after auth changes
