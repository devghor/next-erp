import { queryOptions } from '@tanstack/react-query';
import { getCustomFields } from './service';
import type { CustomField, CustomFieldFilters } from './types';

export type { CustomField };

export const customFieldKeys = {
  all: ['settings', 'custom-fields'] as const,
  list: (filters: CustomFieldFilters) => [...customFieldKeys.all, 'list', filters] as const,
  detail: (id: number) => [...customFieldKeys.all, 'detail', id] as const
};

export const customFieldsQueryOptions = (filters: CustomFieldFilters) =>
  queryOptions({
    queryKey: customFieldKeys.list(filters),
    queryFn: () => getCustomFields(filters)
  });
