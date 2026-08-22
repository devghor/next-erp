import { queryOptions } from '@tanstack/react-query';
import { getSuppliers } from './service';
import type { Supplier, SupplierFilters } from './types';

export type { Supplier };

export const supplierKeys = {
  all: ['purchase', 'suppliers'] as const,
  list: (filters: SupplierFilters) => [...supplierKeys.all, 'list', filters] as const,
  detail: (id: number) => [...supplierKeys.all, 'detail', id] as const
};

export const suppliersQueryOptions = (filters: SupplierFilters) =>
  queryOptions({
    queryKey: supplierKeys.list(filters),
    queryFn: () => getSuppliers(filters)
  });
