# UI And Design Rules

Purpose: keep the identity app professional, responsive, and consistent with Gracon surfaces.

## Navigation

- Protected workspace navigation is topbar-first. Do not reintroduce the old sidebar shell.
- Settings belongs in the account avatar dropdown, not the primary product navigation.
- Product links belong in `src/constants/nav.tsx`.
- Unavailable products should use non-blocking coming-soon feedback.
- Navigation items should include helpful tooltips where meaning or consequence is not obvious.

## Settings

- `/settings` owns workspace defaults.
- `/settings/profile` owns profile/account details.
- `/settings/activity` owns read-only user activity.
- Settings sidebar should be compact, responsive, and free of duplicated explanatory copy.
- Use switches for binary defaults instead of crowded checkboxes where appropriate.

## Loading And Recovery

- Use `AppLoadingState` for full page or panel loading.
- Use `PremiumLoader` only for small button-level loading.
- Use `RouteRecoveryState` for route-level error and not-found surfaces.
- Avoid inline full-page spinner wrappers.

## Responsive Rules

- Support mobile, tablet, laptop, and desktop.
- No horizontal scrolling.
- Forms stack on mobile.
- Modals should be near-full-screen on mobile.
- Touch targets should be at least 44px.

## Styling Rules

- Use scoped CSS modules for page/component surfaces.
- Avoid gradients on containers and cards.
- Keep purple as the primary action color, but avoid purple-dominant backgrounds.
- Use DM Sans only.
- Keep typography compact and readable; do not use oversized dashboard text inside dense account surfaces.
