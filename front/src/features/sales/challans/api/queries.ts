import { queryOptions } from '@tanstack/react-query';
import { getChallans, getChallan, getAvailablePackingSlips } from './service';
import type { Challan, ChallanFilters } from './types';

export type { Challan };

export const challanKeys = {
  all: ['sale', 'challans'] as const,
  list: (filters: ChallanFilters) => [...challanKeys.all, 'list', filters] as const,
  detail: (id: number) => [...challanKeys.all, 'detail', id] as const,
  availablePackingSlips: () => [...challanKeys.all, 'available-packing-slips'] as const
};

export const challansQueryOptions = (filters: ChallanFilters) =>
  queryOptions({
    queryKey: challanKeys.list(filters),
    queryFn: () => getChallans(filters)
  });

export const challanQueryOptions = (id: number) =>
  queryOptions({
    queryKey: challanKeys.detail(id),
    queryFn: () => getChallan(id),
    enabled: id > 0
  });

export const availablePackingSlipsQueryOptions = () =>
  queryOptions({
    queryKey: challanKeys.availablePackingSlips(),
    queryFn: () => getAvailablePackingSlips()
  });
