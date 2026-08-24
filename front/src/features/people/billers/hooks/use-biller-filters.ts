'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { BillerFilters } from '../api/types';

function toDateString(epochMs: number | null | undefined): string | undefined {
  if (!epochMs) return undefined;
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function useBillerFilters(): BillerFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    id: parseAsString,
    name: parseAsString,
    company_name: parseAsString,
    phone: parseAsString,
    email: parseAsString,
    address: parseAsString,
    city: parseAsString,
    country: parseAsString,
    vat_number: parseAsString,
    created_at: parseAsArrayOf(parseAsInteger)
  });

  const dateFrom = toDateString(params.created_at?.[0]);
  const dateTo = toDateString(params.created_at?.[1]);

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.id && { id: params.id }),
    ...(params.name && { name: params.name }),
    ...(params.company_name && { company_name: params.company_name }),
    ...(params.phone && { phone: params.phone }),
    ...(params.email && { email: params.email }),
    ...(params.address && { address: params.address }),
    ...(params.city && { city: params.city }),
    ...(params.country && { country: params.country }),
    ...(params.vat_number && { vat_number: params.vat_number }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo })
  };
}
