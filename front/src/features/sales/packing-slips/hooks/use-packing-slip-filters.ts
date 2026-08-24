'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { PackingSlipFilters } from '../api/types';

export function usePackingSlipFilters(): PackingSlipFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    reference_no: parseAsString,
    status: parseAsString
  });

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.reference_no && { reference_no: params.reference_no }),
    ...(params.status && { status: params.status })
  };
}
