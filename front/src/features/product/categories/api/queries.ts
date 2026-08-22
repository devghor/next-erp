import { queryOptions } from '@tanstack/react-query';
import { getCategories } from './service';
import type { Category, CategoryFilters } from './types';

export type { Category };

export const categoryKeys = {
  all: ['product', 'categories'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.all, 'list', filters] as const,
  detail: (id: number) => [...categoryKeys.all, 'detail', id] as const
};

export const categoriesQueryOptions = (filters: CategoryFilters) =>
  queryOptions({
    queryKey: categoryKeys.list(filters),
    queryFn: () => getCategories(filters)
  });
