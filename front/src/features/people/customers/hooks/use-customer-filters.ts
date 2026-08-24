'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { CustomerFilters } from '../api/types';

function toDateString(epochMs: number | null | undefined): string | undefined {
  if (!epochMs) return undefined;
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function useCustomerFilters(): CustomerFilters {
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
    state: parseAsString,
    postal_code: parseAsString,
    country: parseAsString,
    tax_number: parseAsString,
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
    ...(params.state && { state: params.state }),
    ...(params.postal_code && { postal_code: params.postal_code }),
    ...(params.country && { country: params.country }),
    ...(params.tax_number && { tax_number: params.tax_number }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo })
  };
}
