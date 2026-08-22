'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { BarcodeSettingFilters } from '../api/types';

export function useBarcodeSettingFilters(): BarcodeSettingFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString
  });

  return {
    page: params.page,
    per_page: params.perPage,
    ...(params.name && { name: params.name })
  };
}
