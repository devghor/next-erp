import { queryOptions } from '@tanstack/react-query';
import { getSales, getSale } from './service';
import type { Sale, SaleFilters } from './types';

export type { Sale };

export const saleKeys = {
  all: ['sale', 'sales'] as const,
  list: (filters: SaleFilters) => [...saleKeys.all, 'list', filters] as const,
  detail: (id: number) => [...saleKeys.all, 'detail', id] as const
};

export const salesQueryOptions = (filters: SaleFilters) =>
  queryOptions({
    queryKey: saleKeys.list(filters),
    queryFn: () => getSales(filters)
  });

export const saleQueryOptions = (id: number) =>
  queryOptions({
    queryKey: saleKeys.detail(id),
    queryFn: () => getSale(id)
  });
