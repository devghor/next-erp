import { queryOptions } from '@tanstack/react-query';
import { getQuotations, getQuotation } from './service';
import type { Quotation, QuotationFilters } from './types';

export type { Quotation };

export const quotationKeys = {
  all: ['quotation', 'quotations'] as const,
  list: (filters: QuotationFilters) => [...quotationKeys.all, 'list', filters] as const,
  detail: (id: number) => [...quotationKeys.all, 'detail', id] as const
};

export const quotationsQueryOptions = (filters: QuotationFilters) =>
  queryOptions({
    queryKey: quotationKeys.list(filters),
    queryFn: () => getQuotations(filters)
  });

export const quotationQueryOptions = (id: number) =>
  queryOptions({
    queryKey: quotationKeys.detail(id),
    queryFn: () => getQuotation(id)
  });
