# Feature Data Layer

Every feature's `api/` folder has four files, imported one-directionally
(components never skip a layer):

```
api/types.ts       response/filter/payload shapes matching the Laravel resource
api/service.ts     functions calling apiClient<T>('/endpoint', config) — the only file that changes if the backend URL/shape changes
api/queries.ts     key factory ({feature}Keys.all/list/detail) + queryOptions
api/mutations.ts   mutationOptions per action, onSuccess invalidates {feature}Keys.all
```

Reference implementation: `src/features/settings/users`, `src/features/settings/roles`.

- Components import types from `types.ts`, call mutations via `useMutation(theMutationOptions)`
  from `mutations.ts`, and read via `useSuspenseQuery(theQueryOptions)` from `queries.ts`.
  Never call `service.ts` functions directly from a component — go through
  `queries.ts`/`mutations.ts` so cache keys and invalidation stay centralized.
- Invalidation lives inside `mutations.ts`'s `onSuccess`, not at the call site —
  don't re-invalidate in the component after calling a mutation.
- Query key factory invalidates the whole `{feature}Keys.all` on any mutation
  (create/update/delete/bulk-delete/import) rather than targeting individual
  keys — matches the "company switch invalidates everything" pattern in
  `company-store.ts`; per-key surgical invalidation isn't used in this codebase.
