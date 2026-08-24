import { queryOptions } from '@tanstack/react-query';
import { getBillers } from './service';
import type { Biller, BillerFilters } from './types';

export type { Biller };

export const billerKeys = {
  all: ['people', 'billers'] as const,
  list: (filters: BillerFilters) => [...billerKeys.all, 'list', filters] as const,
  detail: (id: number) => [...billerKeys.all, 'detail', id] as const
};

export const billersQueryOptions = (filters: BillerFilters) =>
  queryOptions({
    queryKey: billerKeys.list(filters),
    queryFn: () => getBillers(filters)
  });
