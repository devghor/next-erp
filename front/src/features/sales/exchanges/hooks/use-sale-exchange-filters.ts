'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { SaleExchangeFilters } from '../api/types';

function toDateString(epochMs: number | null | undefined): string | undefined {
  if (!epochMs) return undefined;
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function useSaleExchangeFilters(): SaleExchangeFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    warehouse_id: parseAsString,
    customer_id: parseAsString,
    created_at: parseAsArrayOf(parseAsInteger)
  });

  const dateFrom = toDateString(params.created_at?.[0]);
  const dateTo = toDateString(params.created_at?.[1]);

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.warehouse_id && { warehouse_id: params.warehouse_id }),
    ...(params.customer_id && { customer_id: params.customer_id }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo })
  };
}
