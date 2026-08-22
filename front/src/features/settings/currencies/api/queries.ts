import { queryOptions } from '@tanstack/react-query';
import { getCurrencies } from './service';
import type { Currency, CurrencyFilters } from './types';

export type { Currency };

export const currencyKeys = {
  all: ['settings', 'currencies'] as const,
  list: (filters: CurrencyFilters) => [...currencyKeys.all, 'list', filters] as const,
  detail: (id: number) => [...currencyKeys.all, 'detail', id] as const
};

export const currenciesQueryOptions = (filters: CurrencyFilters) =>
  queryOptions({
    queryKey: currencyKeys.list(filters),
    queryFn: () => getCurrencies(filters)
  });
