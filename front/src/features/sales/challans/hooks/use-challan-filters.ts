'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { ChallanFilters } from '../api/types';

export function useChallanFilters(): ChallanFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    status: parseAsString,
    courier_id: parseAsString
  });

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.status && { status: params.status }),
    ...(params.courier_id && { courier_id: params.courier_id })
  };
}
