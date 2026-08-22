import { queryOptions } from '@tanstack/react-query';
import { getWarehouses } from './service';
import type { Warehouse, WarehouseFilters } from './types';

export type { Warehouse };

export const warehouseKeys = {
  all: ['settings', 'warehouses'] as const,
  list: (filters: WarehouseFilters) => [...warehouseKeys.all, 'list', filters] as const,
  detail: (id: number) => [...warehouseKeys.all, 'detail', id] as const
};

export const warehousesQueryOptions = (filters: WarehouseFilters) =>
  queryOptions({
    queryKey: warehouseKeys.list(filters),
    queryFn: () => getWarehouses(filters)
  });
