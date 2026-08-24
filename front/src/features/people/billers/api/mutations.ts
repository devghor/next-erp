import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createBiller,
  updateBiller,
  deleteBiller,
  bulkDeleteBillers,
  importBillers
} from './service';
import { billerKeys } from './queries';
import type { BillerMutationPayload } from './types';

export const createBillerMutation = mutationOptions({
  mutationFn: (data: BillerMutationPayload) => createBiller(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
  }
});

export const updateBillerMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: BillerMutationPayload }) =>
    updateBiller(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
  }
});

export const deleteBillerMutation = mutationOptions({
  mutationFn: (id: number) => deleteBiller(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
  }
});

export const bulkDeleteBillersMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteBillers(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
  }
});

export const importBillersMutation = mutationOptions({
  mutationFn: (file: File) => importBillers(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
  }
});
