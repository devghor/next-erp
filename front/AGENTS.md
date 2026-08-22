# AGENTS.md - AI Coding Agent Reference

Frontend for **next-erp** — Next.js admin dashboard, backend is the sibling
Laravel app in `../backend` (Sanctum auth, multi-company).

**Before editing any file under `src/`**, check `.agents/rules/index.md` for a
matching glob and read that rule file first — no auto-load tool here (unlike
backend's Boost), so this file is the trigger.

---

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.7 (strict)
- **Auth**: Auth.js (next-auth v5) Credentials provider → delegates to Laravel
  Sanctum `/auth/login`; JWT session carries `accessToken`
- **Styling**: Tailwind CSS v4, shadcn/ui (New York style), OKLCH theme tokens
- **State**: Zustand (`company-store` for active company), nuqs (URL state),
  TanStack Form + Zod
- **Data**: TanStack Query + TanStack Table, axios client in `src/lib/api-client.ts`
- **Lint/format**: oxlint + oxfmt (not ESLint/Prettier), Husky + lint-staged
- **Package manager**: pnpm

---

## Project Structure

```
/src
├── app/                    # App Router
│   ├── dashboard/          # settings/, overview/ (parallel routes), notifications/
│   ├── auth/               # sign-in, sign-up
│   ├── api/                # route handlers — users/products are leftover mock demo routes
│   ├── layout.tsx, proxy.ts (middleware, protects /dashboard/*)
├── components/
│   ├── ui/                 # shadcn components — don't edit directly, extend instead
│   ├── layout/              # page-container.tsx, sidebar, header
│   ├── forms/fields/        # shared TanStack Form field components
│   ├── themes/               # theme registry + provider
│   ├── kbar/, modal/, buttons/
│   └── icons.tsx            # single icon source (Tabler)
├── features/
│   ├── settings/roles/      # real backend feature — RBAC roles + permission picker
│   ├── settings/users/      # real backend feature — user management
│   ├── overview/, notifications/, profile/, auth/
│   └── <name>/api/{types,service,queries,mutations}.ts pattern
├── config/nav-config.ts     # sidebar + Cmd+K nav, RBAC-ready via `access`
├── hooks/, lib/, store/, types/, styles/themes/
/docs                        # deployment.md, forms.md, themes.md
/scripts                     # cleanup.js — leftover mock-feature removal tool, not wired to real backend features
```

---

## Backend Integration (real, not mock)

`src/features/settings/{roles,users}` are wired to the actual Laravel API —
this is the reference pattern for new features, **not** the mock/service-layer
template described in `docs/*` for demo features (`overview`, `src/app/api/products`,
`src/app/api/users` are old template leftovers, still mock-backed).

- `src/lib/api-client.ts` — axios instance, `baseURL` = `NEXT_PUBLIC_BACKEND_API_URL`
  (`http://localhost:8000/api/v1/web` in dev). Request interceptor attaches
  `Authorization: Bearer <accessToken>` (from session) and `X-Company-ID`
  (from `useCompanyStore`, client-side only).
- `src/store/company-store.ts` — `activeCompanyId`, persisted. Switching company
  calls `getQueryClient().invalidateQueries()` with no key filter — every query
  in the app is company-scoped implicitly through the header, so no per-feature
  query key needs the company id baked in.
- `src/auth.ts` — Credentials `authorize()` posts to `/auth/login`, returns
  `{ id, email, name, accessToken }`. Session strategy is JWT.
- Service layer per feature: `api/types.ts` → `api/service.ts` (calls `apiClient`)
  → `api/queries.ts` (query key factory + `queryOptions`) → `api/mutations.ts`
  (`mutationOptions`, each invalidates `<feature>Keys.all` in `onSuccess`).

### Adding a real-backend feature

1. `api/types.ts` — response/filter/payload shapes matching the Laravel resource.
2. `api/service.ts` — functions calling `apiClient<T>('/endpoint', config)`.
3. `api/queries.ts` — key factory (`{feature}Keys.all/list/detail`) + `queryOptions`.
4. `api/mutations.ts` — `mutationOptions` per action, invalidate `{feature}Keys.all`.
5. `components/` — listing/table/form-sheet, following `settings/users` as the template.
6. Page route under `src/app/dashboard/<name>/`, nav entry in `nav-config.ts`.

---

## Build & Development Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
pnpm typecheck    # tsc --noEmit
```

No lint/format scripts in package.json — oxlint/oxfmt run via lint-staged on
commit (`.husky/pre-commit` → `npx lint-staged`, config in `package.json`).
Run directly if needed: `npx oxlint`, `npx oxfmt --write <files>`.

---

## Environment

Copy `env.example.txt` → `.env.local`:

```env
AUTH_SECRET=                        # npx auth secret
AUTH_DEMO_EMAIL=                    # unused now that authorize() hits real backend; harmless to leave
AUTH_DEMO_PASSWORD=
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000/api/v1/web
```

Sentry vars (`NEXT_PUBLIC_SENTRY_*`, `SENTRY_AUTH_TOKEN`) optional — see
`src/instrumentation.ts` / `src/instrumentation-client.ts`.

---

## Code Style

- TypeScript strict, explicit return types for public functions, `@/*` alias.
- oxlint config: `.oxlintrc.json` (eslint/typescript/unicorn/oxc/react/nextjs/import/jsx-a11y plugins).
- Function declarations for components; props type named `{ComponentName}Props`.
- Server components by default; `'use client'` only when needed.
- Never concatenate classNames — always `cn()`.

---

## Theming

Multi-theme system, OKLCH tokens, 10 built-in themes (`claude`, `discord`,
`supabase`, `vercel`, `mono`, `notebook`, `light-green`, `zen`, `astro-vista`,
`whatsapp`). Registry: `src/components/themes/theme.config.ts`. CSS per theme:
`src/styles/themes/{name}.css`, imported in `src/styles/theme.css`. Full guide:
`docs/themes.md`.

---

## Auth & Navigation

- Server: `const session = await auth()` from `@/auth`; `session.user` undefined when signed out.
- Client: `useSession()` from `next-auth/react`.
- Sign in/out: `signIn('credentials', { email, password, redirect: false })` /
  `signOut({ callbackUrl: '/auth/sign-in' })`.
- `src/proxy.ts` protects every `/dashboard/*` route, redirects to `/auth/sign-in`.
- `nav-config.ts` items may carry `access: PermissionCheck` (`permission`/`role`/`plan`/`feature`,
  types in `src/types/index.ts`); `src/hooks/use-nav.ts` doesn't filter yet — wire it up once
  the roles/permissions feature's data shape is used for the signed-in user's own permissions.

## Data Fetching (TanStack Query)

Server prefetch + client suspense pattern, same as documented for the mock
features — applies identically to real-backend ones:

```tsx
// Server component
const queryClient = getQueryClient();
void queryClient.prefetchQuery(entitiesQueryOptions(filters)); // void, not await
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<Skeleton />}>
      <EntityTable />
    </Suspense>
  </HydrationBoundary>
);

// Client component
const { data } = useSuspenseQuery(entitiesQueryOptions(filters)); // not useQuery
```

Mutations: import from `api/mutations.ts`, call `useMutation(theMutationOptions)`
— invalidation is already wired inside `onSuccess`, don't duplicate it at the call site.

URL state: `nuqs` — `searchParamsCache` server-side, `useQueryState({ shallow: true })` client-side.

Tables: TanStack Table, columns in `features/*/components/*-tables/columns.tsx`,
shared table component `src/components/ui/table/data-table.tsx`.

---

## Icons

Single source: `src/components/icons.tsx`, wraps `@tabler/icons-react`. Never
import icons directly elsewhere — add a semantic key to `Icons` and use `Icons.key`.

---

## Forms

`useAppForm` from `@/lib/form` + `form.AppField` rendering shared components
from `@/components/forms/fields` (shadcn TanStack Form anatomy). `SubmitButton`
handles pending state via `form.Subscribe`. Never `useState` inside a render
prop — extract stateful controls into components. Full guide: `docs/forms.md`.

---

## Conventions Checklist

1. `cn()` for all className merging.
2. Feature code lives in `src/features/<name>/`.
3. Server components by default.
4. Avoid `any`; explicit types.
5. Check `settings/users` or `settings/roles` as the template for new real-backend features — not the mock `overview`/`products` demo code.
6. `NEXT_PUBLIC_` prefix for client-exposed env vars.
7. Don't edit `src/components/ui/*` directly — extend/wrap instead.
8. Icons only via `Icons` object in `src/components/icons.tsx`.
9. Page headers via `PageContainer` props (`pageTitle`, `pageDescription`, `pageHeaderAction`) — never a manual `<Heading>` in a page.
10. `<Button isLoading={isPending}>` for loading states (CSS grid overlap, zero layout shift); `SubmitButton` does this automatically for forms.
11. Data layer always `types.ts` → `service.ts` → `queries.ts`/`mutations.ts`; components never import `@/constants/mock-api*` directly.
12. `scripts/cleanup.js` is a leftover template tool for removing mock demo features — irrelevant to the real settings features; don't extend it for new work.

## External Docs

- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)
- [TanStack Form](https://tanstack.com/form/latest)
