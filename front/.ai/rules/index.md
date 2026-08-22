# Rules Index

Maps file globs to rule files. No auto-load tool here (unlike backend's Boost) —
`front/AGENTS.md` points here explicitly; read the matching rule file(s) before
editing any path below.

| Glob | Rule file | Covers |
| --- | --- | --- |
| `src/features/**/api/**` | [feature-data-layer.md](feature-data-layer.md) | types → service → queries → mutations pattern, invalidation |
| `src/features/**`, `src/app/api/**` | [real-backend-vs-mock.md](real-backend-vs-mock.md) | which features are real (Laravel-backed) vs template mock leftovers |
| `src/components/**`, `src/app/**` | [component-conventions.md](component-conventions.md) | icons, PageContainer, Button loading, shadcn ui edits |

Add a row here whenever a new rule file is added — don't leave one orphaned.
