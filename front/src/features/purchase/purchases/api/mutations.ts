import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createPurchase, updatePurchase, deletePurchase, bulkDeletePurchases } from './service';
import { purchaseKeys } from './queries';
import type { PurchaseMutationPayload } from './types';

export const createPurchaseMutation = mutationOptions({
  mutationFn: (data: PurchaseMutationPayload) => createPurchase(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});

export const updatePurchaseMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: PurchaseMutationPayload }) =>
    updatePurchase(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});

export const deletePurchaseMutation = mutationOptions({
  mutationFn: (id: number) => deletePurchase(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});

export const bulkDeletePurchasesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeletePurchases(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});
