import { queryOptions } from '@tanstack/react-query';
import { getPackingSlips, getAvailableSaleLines } from './service';
import type { PackingSlip, PackingSlipFilters } from './types';

export type { PackingSlip };

export const packingSlipKeys = {
  all: ['sales', 'packing-slips'] as const,
  list: (filters: PackingSlipFilters) => [...packingSlipKeys.all, 'list', filters] as const,
  detail: (id: number) => [...packingSlipKeys.all, 'detail', id] as const,
  availableLines: (saleId: number) => [...packingSlipKeys.all, 'available-lines', saleId] as const
};

export const packingSlipsQueryOptions = (filters: PackingSlipFilters) =>
  queryOptions({
    queryKey: packingSlipKeys.list(filters),
    queryFn: () => getPackingSlips(filters)
  });

export const availableSaleLinesQueryOptions = (saleId: number) =>
  queryOptions({
    queryKey: packingSlipKeys.availableLines(saleId),
    queryFn: () => getAvailableSaleLines(saleId),
    enabled: saleId > 0
  });
