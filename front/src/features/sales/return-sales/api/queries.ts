import { queryOptions } from '@tanstack/react-query';
import { getSaleReturns, getSaleReturn, getAvailableReturnLines } from './service';
import type { SaleReturn, SaleReturnFilters } from './types';

export type { SaleReturn };

export const saleReturnKeys = {
  all: ['sale', 'sale-returns'] as const,
  list: (filters: SaleReturnFilters) => [...saleReturnKeys.all, 'list', filters] as const,
  detail: (id: number) => [...saleReturnKeys.all, 'detail', id] as const,
  availableLines: (saleId: number) => [...saleReturnKeys.all, 'available-lines', saleId] as const
};

export const saleReturnsQueryOptions = (filters: SaleReturnFilters) =>
  queryOptions({
    queryKey: saleReturnKeys.list(filters),
    queryFn: () => getSaleReturns(filters)
  });

export const saleReturnQueryOptions = (id: number) =>
  queryOptions({
    queryKey: saleReturnKeys.detail(id),
    queryFn: () => getSaleReturn(id)
  });

export const availableReturnLinesQueryOptions = (saleId: number) =>
  queryOptions({
    queryKey: saleReturnKeys.availableLines(saleId),
    queryFn: () => getAvailableReturnLines(saleId),
    enabled: saleId > 0
  });
