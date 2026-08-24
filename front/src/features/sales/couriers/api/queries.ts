import { queryOptions } from '@tanstack/react-query';
import { getCouriers } from './service';
import type { Courier, CourierFilters } from './types';

export type { Courier };

export const courierKeys = {
  all: ['sales', 'couriers'] as const,
  list: (filters: CourierFilters) => [...courierKeys.all, 'list', filters] as const,
  detail: (id: number) => [...courierKeys.all, 'detail', id] as const
};

export const couriersQueryOptions = (filters: CourierFilters) =>
  queryOptions({
    queryKey: courierKeys.list(filters),
    queryFn: () => getCouriers(filters)
  });
