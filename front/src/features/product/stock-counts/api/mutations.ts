import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createStockCount,
  updateStockCount,
  submitStockCount,
  adjustStockCount,
  deleteStockCount,
  bulkDeleteStockCounts
} from './service';
import { stockCountKeys } from './queries';
import type {
  StockCountCreatePayload,
  StockCountUpdatePayload,
  StockCountSubmitPayload
} from './types';

export const createStockCountMutation = mutationOptions({
  mutationFn: (data: StockCountCreatePayload) => createStockCount(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
  }
});

export const updateStockCountMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: StockCountUpdatePayload }) =>
    updateStockCount(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
  }
});

export const submitStockCountMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: StockCountSubmitPayload }) =>
    submitStockCount(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
  }
});

export const adjustStockCountMutation = mutationOptions({
  mutationFn: (id: number) => adjustStockCount(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
  }
});

export const deleteStockCountMutation = mutationOptions({
  mutationFn: (id: number) => deleteStockCount(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
  }
});

export const bulkDeleteStockCountsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteStockCounts(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
  }
});
