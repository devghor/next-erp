'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { ProductFilters } from '../api/types';

function toDateString(epochMs: number | null | undefined): string | undefined {
  if (!epochMs) return undefined;
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function useProductFilters(): ProductFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    id: parseAsString,
    name: parseAsString,
    category_id: parseAsString,
    brand_id: parseAsString,
    unit_id: parseAsString,
    tax_id: parseAsString,
    type: parseAsString,
    created_at: parseAsArrayOf(parseAsInteger)
  });

  const dateFrom = toDateString(params.created_at?.[0]);
  const dateTo = toDateString(params.created_at?.[1]);

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.id && { id: params.id }),
    ...(params.name && { name: params.name }),
    ...(params.category_id && { category_id: params.category_id }),
    ...(params.brand_id && { brand_id: params.brand_id }),
    ...(params.unit_id && { unit_id: params.unit_id }),
    ...(params.tax_id && { tax_id: params.tax_id }),
    ...(params.type && { type: params.type }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo })
  };
}
