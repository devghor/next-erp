import { queryOptions } from '@tanstack/react-query';
import { getPurchases, getPurchase } from './service';
import type { Purchase, PurchaseFilters } from './types';

export type { Purchase };

export const purchaseKeys = {
  all: ['purchase', 'purchases'] as const,
  list: (filters: PurchaseFilters) => [...purchaseKeys.all, 'list', filters] as const,
  detail: (id: number) => [...purchaseKeys.all, 'detail', id] as const
};

export const purchasesQueryOptions = (filters: PurchaseFilters) =>
  queryOptions({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => getPurchases(filters)
  });

export const purchaseQueryOptions = (id: number) =>
  queryOptions({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => getPurchase(id)
  });
