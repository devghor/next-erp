import { queryOptions } from '@tanstack/react-query';
import { getDeliveries } from './service';
import type { Delivery, DeliveryFilters } from './types';

export type { Delivery };

export const deliveryKeys = {
  all: ['sales', 'deliveries'] as const,
  list: (filters: DeliveryFilters) => [...deliveryKeys.all, 'list', filters] as const,
  detail: (id: number) => [...deliveryKeys.all, 'detail', id] as const
};

export const deliveriesQueryOptions = (filters: DeliveryFilters) =>
  queryOptions({
    queryKey: deliveryKeys.list(filters),
    queryFn: () => getDeliveries(filters)
  });
