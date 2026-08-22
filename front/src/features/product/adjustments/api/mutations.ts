import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createAdjustment,
  updateAdjustment,
  deleteAdjustment,
  bulkDeleteAdjustments
} from './service';
import { adjustmentKeys } from './queries';
import type { AdjustmentMutationPayload } from './types';

export const createAdjustmentMutation = mutationOptions({
  mutationFn: (data: AdjustmentMutationPayload) => createAdjustment(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
  }
});

export const updateAdjustmentMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: AdjustmentMutationPayload }) =>
    updateAdjustment(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
  }
});

export const deleteAdjustmentMutation = mutationOptions({
  mutationFn: (id: number) => deleteAdjustment(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
  }
});

export const bulkDeleteAdjustmentsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteAdjustments(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
  }
});
