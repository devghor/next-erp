# next-erp

Multi-tenant ERP system. Laravel API backend, Next.js admin dashboard frontend.

## Modules

- **Auth** — Sanctum token login
- **Settings → Users** — company-scoped user management (CRUD, bulk delete, PDF/Excel export, import)
- **Settings → Roles & Permissions** — RBAC via `spatie/laravel-permission` (teams = companies)
- **Multi-company** — every user can belong to multiple companies; the active company scopes every request (`stancl/tenancy`)

More modules land the same way: Laravel controller/service pair + matching Next.js feature — see `docs/architecture.md`.

## Stack

| | |
| --- | --- |
| **Backend** | Laravel 12, PHP 8.4, Sanctum, `stancl/tenancy`, `spatie/laravel-permission`, `maatwebsite/excel`, `barryvdh/laravel-dompdf` |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, TanStack Query/Table/Form, Zustand, Auth.js |

## Repo layout

```
next-erp/
├── backend/    Laravel API           → backend/AGENTS.md, backend/.agents/rules/
├── front/      Next.js dashboard     → front/AGENTS.md, front/.agents/rules/
└── docs/
    └── architecture.md   auth flow, multi-tenancy, API shape across both apps
```

## Getting started

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve          # http://localhost:8000
```

Or run everything (server + queue + logs) at once: `composer run dev`.

### Frontend

```bash
cd front
pnpm install
cp env.example.txt .env.local
pnpm dev                    # http://localhost:3000
```

Set `NEXT_PUBLIC_BACKEND_API_URL` in `front/.env.local` to the backend's API
base (default `http://localhost:8000/api/v1/web`), and `AUTH_SECRET` (generate
with `npx auth secret`).