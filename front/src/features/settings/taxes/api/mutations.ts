import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createTax, updateTax, deleteTax, bulkDeleteTaxes, importTaxes } from './service';
import { taxKeys } from './queries';
import type { TaxMutationPayload } from './types';

export const createTaxMutation = mutationOptions({
  mutationFn: (data: TaxMutationPayload) => createTax(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
  }
});

export const updateTaxMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: TaxMutationPayload }) =>
    updateTax(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
  }
});

export const deleteTaxMutation = mutationOptions({
  mutationFn: (id: number) => deleteTax(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
  }
});

export const bulkDeleteTaxesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteTaxes(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
  }
});

export const importTaxesMutation = mutationOptions({
  mutationFn: (file: File) => importTaxes(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
  }
});
