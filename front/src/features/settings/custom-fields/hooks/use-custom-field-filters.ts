'use client';

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { CustomFieldFilters } from '../api/types';

function toDateString(epochMs: number | null | undefined): string | undefined {
  if (!epochMs) return undefined;
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function useCustomFieldFilters(): CustomFieldFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    id: parseAsString,
    belongs_to: parseAsString,
    name: parseAsString,
    created_at: parseAsArrayOf(parseAsInteger)
  });

  const dateFrom = toDateString(params.created_at?.[0]);
  const dateTo = toDateString(params.created_at?.[1]);

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.id && { id: params.id }),
    ...(params.belongs_to && { belongs_to: params.belongs_to }),
    ...(params.name && { name: params.name }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo })
  };
}
