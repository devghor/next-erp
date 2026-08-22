# AGENTS.md - next-erp

Multi-tenant ERP. Two apps, one repo, no shared package manager workspace
(`backend` is PHP/Composer, `front` is pnpm — independent installs).

```
next-erp/
├── backend/    Laravel 12 API — see backend/AGENTS.md
│   └── .agents/rules/    area-grouped standing rules, Boost-loaded (index.md maps globs → rule files)
├── front/      Next.js 16 admin dashboard — see front/AGENTS.md
│   └── .agents/rules/    area-grouped standing rules (index.md maps globs → rule files; no auto-load, front/AGENTS.md points here)
└── docs/
    └── architecture.md   system-level architecture (this repo, both apps)
```

- Backend conventions, Artisan/Boost workflow, PHP/Pint/PHPUnit rules → [backend/AGENTS.md](backend/AGENTS.md)
- Backend standing rules (service layer, API module shape, multi-tenancy) → [backend/.agents/rules/index.md](backend/.agents/rules/index.md)
- Frontend conventions, feature pattern, theming, forms → [front/AGENTS.md](front/AGENTS.md)
- Frontend standing rules (data layer, real-vs-mock, component conventions) → [front/.agents/rules/index.md](front/.agents/rules/index.md)
- Cross-cutting architecture (auth flow, multi-tenancy, how the two apps talk) → [docs/architecture.md](docs/architecture.md)

Read the relevant sub-AGENTS.md before editing inside `backend/` or `front/` —
this file only covers what spans both.
