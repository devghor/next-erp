import { queryOptions } from '@tanstack/react-query';
import { getProducts, getProduct, getProductHistory } from './service';
import type { Product, ProductFilters } from './types';

export type { Product };

export const productKeys = {
  all: ['product', 'products'] as const,
  list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
  history: (id: number) => [...productKeys.all, 'history', id] as const
};

export const productsQueryOptions = (filters: ProductFilters) =>
  queryOptions({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters)
  });

export const productQueryOptions = (id: number) =>
  queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id)
  });

export const productHistoryQueryOptions = (id: number) =>
  queryOptions({
    queryKey: productKeys.history(id),
    queryFn: () => getProductHistory(id)
  });
