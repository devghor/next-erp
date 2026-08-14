# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This top-level directory is not a git repo (no `.git` anywhere in the tree currently). It contains two independent, unwired projects:

- **[front/](front/)** — Next.js 16 + shadcn/ui admin dashboard (Kiranism starter). This is the active project. Run all frontend commands from `front/`.
- **[backend/](backend/)** — stock Laravel 13 skeleton (`composer create-project` output, unmodified aside from an extra `personal_access_tokens` migration). Only `App\Models\User` and the default `Controller` exist; no custom routes beyond the sample `/user` endpoint in `routes/api.php`. Treat as scaffolding, not an implemented API.

The two are **not currently connected** — `front/` fetches all data through its mock service layer (`src/constants/mock-api*.ts`); nothing in `front/` calls into `backend/`. If asked to wire them together, `front`'s data-fetching docs describe the BFF pattern to use (route handlers in `src/app/api/` proxying to an external backend).

`front/` already has its own, thorough `CLAUDE.md` and `AGENTS.md` — read those first for conventions, architecture, and data-fetching patterns:

- [front/CLAUDE.md](front/CLAUDE.md) — critical conventions + links to `docs/`
- [front/AGENTS.md](front/AGENTS.md) — full stack, structure, and pattern reference

## Commands

### Frontend (run from `front/`)

```bash
bun install
bun run dev          # http://localhost:3000
bun run build
bun run typecheck    # tsc --noEmit
bun run lint         # oxlint
bun run lint:fix     # oxlint --fix && oxfmt
bun run format       # oxfmt --write
bun run cleanup --interactive   # strip optional features (clerk, kanban, chat, ai-chat, notifications, themes, sentry)
```

Note: `front/AGENTS.md` describes lint/format as ESLint + Prettier, but the current toolchain (per `front/package.json`) is **OxLint** (`front/.oxlintrc.json`) and **Oxfmt** (`front/.oxfmtrc.json`) — trust the scripts in `package.json` over that section of AGENTS.md.

No frontend test suite is configured.

### Backend (run from `backend/`)

```bash
composer install
composer run dev     # php artisan serve + queue:listen + pail + vite, concurrently
php artisan migrate
composer run test    # php artisan test (PHPUnit)
./vendor/bin/pint     # code style (Laravel Pint)
```

Standard Laravel conventions apply (routes in `routes/`, Eloquent models in `app/Models/`, controllers in `app/Http/Controllers/`) — there isn't yet enough custom code here to document beyond that.
