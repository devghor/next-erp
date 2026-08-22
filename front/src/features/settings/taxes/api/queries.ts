import { queryOptions } from '@tanstack/react-query';
import { getTaxes } from './service';
import type { Tax, TaxFilters } from './types';

export type { Tax };

export const taxKeys = {
  all: ['settings', 'taxes'] as const,
  list: (filters: TaxFilters) => [...taxKeys.all, 'list', filters] as const,
  detail: (id: number) => [...taxKeys.all, 'detail', id] as const
};

export const taxesQueryOptions = (filters: TaxFilters) =>
  queryOptions({
    queryKey: taxKeys.list(filters),
    queryFn: () => getTaxes(filters)
  });
