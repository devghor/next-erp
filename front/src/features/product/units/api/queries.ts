import { queryOptions } from '@tanstack/react-query';
import { getUnits } from './service';
import type { Unit, UnitFilters } from './types';

export type { Unit };

export const unitKeys = {
  all: ['product', 'units'] as const,
  list: (filters: UnitFilters) => [...unitKeys.all, 'list', filters] as const,
  detail: (id: number) => [...unitKeys.all, 'detail', id] as const
};

export const unitsQueryOptions = (filters: UnitFilters) =>
  queryOptions({
    queryKey: unitKeys.list(filters),
    queryFn: () => getUnits(filters)
  });
