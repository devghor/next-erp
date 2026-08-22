import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createCurrency,
  updateCurrency,
  deleteCurrency,
  bulkDeleteCurrencies,
  importCurrencies
} from './service';
import { currencyKeys } from './queries';
import type { CurrencyMutationPayload } from './types';

export const createCurrencyMutation = mutationOptions({
  mutationFn: (data: CurrencyMutationPayload) => createCurrency(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
  }
});

export const updateCurrencyMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CurrencyMutationPayload }) =>
    updateCurrency(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
  }
});

export const deleteCurrencyMutation = mutationOptions({
  mutationFn: (id: number) => deleteCurrency(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
  }
});

export const bulkDeleteCurrenciesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteCurrencies(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
  }
});

export const importCurrenciesMutation = mutationOptions({
  mutationFn: (file: File) => importCurrencies(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
  }
});
