# Component Conventions

- **Icons**: single source `src/components/icons.tsx`, wraps `@tabler/icons-react`.
  Never import an icon directly elsewhere — add a semantic key to `Icons` and
  use `Icons.key`.
- **Page headers**: always via `PageContainer` props (`pageTitle`,
  `pageDescription`, `pageHeaderAction`). Never a manual `<Heading>` in a page —
  `PageContainer` renders it internally.
- **Loading state**: `<Button isLoading={isPending}>` (CSS grid overlap, zero
  layout shift). Form submit buttons use `SubmitButton`, which wires this up
  automatically via `form.Subscribe` — don't hand-roll a spinner button in a form.
- **shadcn components** (`src/components/ui/*`): never edit directly — wrap or
  extend instead, so `npx shadcn add`/upgrades don't get silently reverted.
- **className merging**: always `cn()`, never string concatenation/template
  literals for conditional classes.
- **Server vs client**: server components by default; add `'use client'` only
  when the component needs browser APIs, state, or event handlers.
