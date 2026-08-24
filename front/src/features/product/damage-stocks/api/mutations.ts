import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createDamageStock,
  updateDamageStock,
  deleteDamageStock,
  bulkDeleteDamageStocks
} from './service';
import { damageStockKeys } from './queries';
import type { DamageStockMutationPayload } from './types';

export const createDamageStockMutation = mutationOptions({
  mutationFn: (data: DamageStockMutationPayload) => createDamageStock(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
  }
});

export const updateDamageStockMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: DamageStockMutationPayload }) =>
    updateDamageStock(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
  }
});

export const deleteDamageStockMutation = mutationOptions({
  mutationFn: (id: number) => deleteDamageStock(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
  }
});

export const bulkDeleteDamageStocksMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteDamageStocks(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
  }
});
