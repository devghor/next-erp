'use client';

import { parseAsInteger, useQueryStates } from 'nuqs';
import type { InstallmentPlanFilters } from '../api/types';

export function useInstallmentPlanFilters(): InstallmentPlanFilters {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10)
  });

  return {
    page: params.page,
    per_page: params.perPage
  };
}
