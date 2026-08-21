# next-erp

Two independent, currently unwired projects:

- **[front/](front/)** — Next.js 16 + shadcn/ui admin dashboard (active project). All data currently comes from a mock service layer (`src/constants/mock-api*.ts`); nothing calls `backend/` yet.
- **[backend/](backend/)** — Laravel 13 API. Multi-tenancy (company-scoped via `X-Company-ID` header) and user/company management with roles and permissions are implemented; treat everything else as scaffolding.

## Frontend

```bash
cd front
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm typecheck
pnpm lint
pnpm format
```

## Backend

```bash
cd backend
composer install
composer run dev     # serve + queue:listen + pail + vite, concurrently
php artisan migrate
composer run test
./vendor/bin/pint
```

## Status

`front/` and `backend/` are not connected. Wiring them together means adding Next.js route handlers under `front/src/app/api/` that proxy to the Laravel API (BFF pattern) — see `front/`'s data-fetching docs for the pattern to follow.
