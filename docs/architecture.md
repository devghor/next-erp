# Architecture

System-level view across `backend` and `front`. Per-app conventions live in
their own `AGENTS.md` ([backend](../backend/AGENTS.md), [front](../front/AGENTS.md)).

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, TanStack Query/Table/Form, Zustand |
| Backend | Laravel 12, PHP 8.4 |
| Auth | Laravel Sanctum (personal access tokens) via Auth.js Credentials provider |
| Multi-tenancy | `stancl/tenancy` (company-scoped by request header) |
| RBAC | `spatie/laravel-permission` (teams = companies) |
| Exports/Imports | `maatwebsite/excel`, `barryvdh/laravel-dompdf` |

## Request flow

1. User signs in on front (`src/auth.ts`) — Credentials `authorize()` posts
   email/password to backend `POST /api/v1/auth/login` (`LoginController`).
2. Backend returns a Sanctum token + user + companies. Front stores the token
   in the JWT session (`accessToken`) and the user's company list.
3. Every subsequent API call goes through `front/src/lib/api-client.ts`:
   - `Authorization: Bearer <accessToken>`
   - `X-Company-ID: <activeCompanyId>` (from `useCompanyStore`, client-side)
4. On the backend, protected routes run through middleware:
   `auth:sanctum` → `InitializeTenancyByRequestData` (reads `X-Company-ID`,
   scopes the request to that company/tenant) → `set-permissions-team-id`
   (scopes spatie/permission checks to that same company as the "team").
5. Controllers delegate to a Service layer (`app/Services/<Module>/*Service.php`,
   bound to a `*ServiceInterface` in `AppServiceProvider`) implementing a shared
   `BaseServiceInterface` contract: `list`, `forExport`, `create`, `findScoped`,
   `update`, `delete`, `bulkDelete`.

## Switching company (tenant)

Front: `useCompanyStore.setActiveCompanyId()` persists the id and calls
`queryClient.invalidateQueries()` with no filter — every query is implicitly
company-scoped via the `X-Company-ID` header, so a full invalidate on switch
is correct and requires no per-feature wiring.

Backend: nothing to invalidate — every request re-resolves tenancy from the
header, there's no server-side "current company" session state.

## API surface

Base path: `/api/v1`. Example (Settings module, `backend/routes/api.php`):

```
POST   /auth/login
GET    /auth/auth-user                         (auth:sanctum)

# below: auth:sanctum + InitializeTenancyByRequestData + set-permissions-team-id
GET    /settings/users            /settings/roles            /settings/permissions
POST   /settings/users            /settings/roles
PUT    /settings/users/{id}       /settings/roles/{id}
DELETE /settings/users/{id}       /settings/roles/{id}
POST   /settings/users/bulk-delete            /settings/roles/bulk-delete
GET    /settings/users/export/{pdf,excel}     /settings/roles/export/{pdf,excel}
POST   /settings/users/import                 /settings/roles/import
```

New modules follow the same shape: prefix + resource routes + `bulk-delete` /
`export/{pdf,excel}` / `import` siblings, guarded by the same three middleware.

## Frontend feature ↔ backend module mapping

Each front `src/features/settings/<name>/api/{types,service,queries,mutations}.ts`
maps 1:1 onto a backend `Api/V1/Settings/<Name>Controller` + `<Name>Service`.
`settings/users` and `settings/roles` are the reference pair for both sides —
see `front/AGENTS.md` for the frontend half and `backend/AGENTS.md` (Laravel
Boost / Artisan conventions) for the backend half.

Not yet wired end-to-end: `front/src/hooks/use-nav.ts` doesn't filter nav
items by permission yet, even though `nav-config.ts` items support an `access`
field and the backend now has a real roles/permissions model to check against.

## Known template leftovers

`front/src/app/dashboard/overview`, `src/app/api/products`, `src/app/api/users`,
and `scripts/cleanup.js` are leftovers from the original dashboard template —
mock-data backed, not connected to the Laravel backend. Don't use them as the
pattern for new features; use `settings/users` / `settings/roles` instead.
