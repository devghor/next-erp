# Real Backend vs Mock Template Leftovers

This repo's frontend is a customized dashboard template mid-migration to a
real Laravel backend. Two patterns coexist — don't mix them up.

## Real (Laravel-backed) — use these as the pattern for new work

- `src/features/settings/users`, `src/features/settings/roles`
- Calls go through `src/lib/api-client.ts` (axios, `NEXT_PUBLIC_BACKEND_API_URL`,
  attaches `Authorization` + `X-Company-ID`)
- Backend counterpart: `backend/app/Http/Controllers/Api/V1/Settings/*Controller`
  (see `backend/.ai/rules/api-module-shape.md`)

## Mock template leftovers — do not extend, do not copy their pattern

- `src/features/overview` (dashboard charts), `src/app/api/products`,
  `src/app/api/users`, `src/constants/mock-api*.ts`
- `scripts/cleanup.js` + `scripts/cleanup-templates/` — a template tool for
  ripping out these mock demo features; irrelevant to real features, don't
  add new entries to it

If asked to build a new module, check whether a matching backend
controller/service already exists (`backend/app/Http/Controllers/Api/V1/`)
before assuming mock data is acceptable.
