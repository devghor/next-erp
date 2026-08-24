import { queryOptions } from '@tanstack/react-query';
import { getStockCounts, getStockCount } from './service';
import type { StockCount, StockCountFilters } from './types';

export type { StockCount };

export const stockCountKeys = {
  all: ['product', 'stock-counts'] as const,
  list: (filters: StockCountFilters) => [...stockCountKeys.all, 'list', filters] as const,
  detail: (id: number) => [...stockCountKeys.all, 'detail', id] as const
};

export const stockCountsQueryOptions = (filters: StockCountFilters) =>
  queryOptions({
    queryKey: stockCountKeys.list(filters),
    queryFn: () => getStockCounts(filters)
  });

export const stockCountQueryOptions = (id: number) =>
  queryOptions({
    queryKey: stockCountKeys.detail(id),
    queryFn: () => getStockCount(id)
  });
