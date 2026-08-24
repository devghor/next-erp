import { queryOptions } from '@tanstack/react-query';
import { getDamageStocks, getDamageStock } from './service';
import type { DamageStock, DamageStockFilters } from './types';

export type { DamageStock };

export const damageStockKeys = {
  all: ['product', 'damage-stocks'] as const,
  list: (filters: DamageStockFilters) => [...damageStockKeys.all, 'list', filters] as const,
  detail: (id: number) => [...damageStockKeys.all, 'detail', id] as const
};

export const damageStocksQueryOptions = (filters: DamageStockFilters) =>
  queryOptions({
    queryKey: damageStockKeys.list(filters),
    queryFn: () => getDamageStocks(filters)
  });

export const damageStockQueryOptions = (id: number) =>
  queryOptions({
    queryKey: damageStockKeys.detail(id),
    queryFn: () => getDamageStock(id)
  });
