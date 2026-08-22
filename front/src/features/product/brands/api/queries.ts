import { queryOptions } from '@tanstack/react-query';
import { getBrands } from './service';
import type { Brand, BrandFilters } from './types';

export type { Brand };

export const brandKeys = {
  all: ['product', 'brands'] as const,
  list: (filters: BrandFilters) => [...brandKeys.all, 'list', filters] as const,
  detail: (id: number) => [...brandKeys.all, 'detail', id] as const
};

export const brandsQueryOptions = (filters: BrandFilters) =>
  queryOptions({
    queryKey: brandKeys.list(filters),
    queryFn: () => getBrands(filters)
  });
