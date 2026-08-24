'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { SaleFilters } from '../api/types';

function toDateString(epochMs: number | null | undefined): string | undefined {
  if (!epochMs) return undefined;
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function useSaleFilters(): SaleFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    id: parseAsString,
    reference_no: parseAsString,
    sale_status: parseAsString,
    payment_status: parseAsString,
    created_at: parseAsArrayOf(parseAsInteger)
  });

  const dateFrom = toDateString(params.created_at?.[0]);
  const dateTo = toDateString(params.created_at?.[1]);

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.id && { id: params.id }),
    ...(params.reference_no && { reference_no: params.reference_no }),
    ...(params.sale_status && { sale_status: params.sale_status }),
    ...(params.payment_status && { payment_status: params.payment_status }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo })
  };
}
