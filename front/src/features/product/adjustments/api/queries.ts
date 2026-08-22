import { queryOptions } from '@tanstack/react-query';
import { getAdjustments, getAdjustment } from './service';
import type { Adjustment, AdjustmentFilters } from './types';

export type { Adjustment };

export const adjustmentKeys = {
  all: ['product', 'adjustments'] as const,
  list: (filters: AdjustmentFilters) => [...adjustmentKeys.all, 'list', filters] as const,
  detail: (id: number) => [...adjustmentKeys.all, 'detail', id] as const
};

export const adjustmentsQueryOptions = (filters: AdjustmentFilters) =>
  queryOptions({
    queryKey: adjustmentKeys.list(filters),
    queryFn: () => getAdjustments(filters)
  });

export const adjustmentQueryOptions = (id: number) =>
  queryOptions({
    queryKey: adjustmentKeys.detail(id),
    queryFn: () => getAdjustment(id)
  });
