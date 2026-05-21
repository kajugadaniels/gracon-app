# File Structure Rules

Purpose: keep identity-app frontend files typed, scoped, and easy to safely change.

## Required File Shape

- Every file must start with a short top-level comment explaining its purpose.
- Every exported function, component, hook, and public helper must have JSDoc explaining what it does, parameters, and return value.
- Use `const` by default. Use `let` only when reassignment is necessary.
- Do not use `any`; create interfaces, DTO types, or narrow generics.
- Delete dead code instead of commenting it out.
- Keep one React component per file unless a tiny private child is only useful in that file.

## Naming

- React components: `PascalCase.tsx`
- CSS modules: `component-name.module.css` or `route-name.module.css`
- Helpers: `kebab-case.ts`
- Hooks: `useSomething.ts`
- Tests: `*.test.ts` or `*.spec.ts`

## Styling Rules

- Prefer scoped `.module.css` files for route/page/component styling.
- Keep `globals.css` limited to tokens, base elements, shared primitives, and truly global shell behavior.
- Do not add large inline style objects to page components.
- Use existing CSS variables and app design tokens. Do not hardcode color values inline.

## Component Rules

- Keep client components small and explicit about loading, error, and empty states.
- Put async server-only logic in route handlers or server helpers, not browser components.
- Keep auth/session side effects centralized in existing providers/helpers.
