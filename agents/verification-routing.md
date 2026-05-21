# Verification Routing Rules

Purpose: keep identity verification returns safe and user-friendly across Gracon apps.

## Default Behavior

- Without a safe `next` value, successful identity verification returns to `/dashboard`.
- `app/documents` and `app/meetings` may provide safe external `next` URLs so users return to the workflow that requested verification.

## Allowed Return URLs

- Allow only exact origins configured by `NEXT_PUBLIC_DOCS_URL`, `NEXT_PUBLIC_MEETINGS_URL`, and `NEXT_PUBLIC_AUTH_ALLOWED_REDIRECT_ORIGINS`.
- Reject lookalike domains and prefix matches.
- Preserve path and query only after origin validation succeeds.

## Verification Flow

- Keep ID verification and face verification steps aligned with the engine-backed flow.
- Do not bypass engine verification for meeting/document invitation flows.
- Keep account-information, email OTP, identity verification, and acceptance steps clear when external apps request verification.

## UX Rules

- Explain why verification is needed without exposing internal service details.
- Return users to the requesting app after success when the `next` value is safe.
- Show clear recovery UI for camera permission, expired challenge, invalid session, and failed verification states.
