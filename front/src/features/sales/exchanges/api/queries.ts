import { queryOptions } from '@tanstack/react-query';
import { getSaleExchanges, getSaleExchange } from './service';
import type { SaleExchange, SaleExchangeFilters } from './types';

export type { SaleExchange };

export const saleExchangeKeys = {
  all: ['sale', 'sale-exchanges'] as const,
  list: (filters: SaleExchangeFilters) => [...saleExchangeKeys.all, 'list', filters] as const,
  detail: (id: number) => [...saleExchangeKeys.all, 'detail', id] as const
};

export const saleExchangesQueryOptions = (filters: SaleExchangeFilters) =>
  queryOptions({
    queryKey: saleExchangeKeys.list(filters),
    queryFn: () => getSaleExchanges(filters)
  });

export const saleExchangeQueryOptions = (id: number) =>
  queryOptions({
    queryKey: saleExchangeKeys.detail(id),
    queryFn: () => getSaleExchange(id)
  });
