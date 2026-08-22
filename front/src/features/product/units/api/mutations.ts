import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createUnit,
  updateUnit,
  deleteUnit,
  bulkDeleteUnits,
  importUnits
} from './service';
import { unitKeys } from './queries';
import type { UnitMutationPayload } from './types';

export const createUnitMutation = mutationOptions({
  mutationFn: (data: UnitMutationPayload) => createUnit(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
  }
});

export const updateUnitMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: UnitMutationPayload }) =>
    updateUnit(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
  }
});

export const deleteUnitMutation = mutationOptions({
  mutationFn: (id: number) => deleteUnit(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
  }
});

export const bulkDeleteUnitsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteUnits(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
  }
});

export const importUnitsMutation = mutationOptions({
  mutationFn: (file: File) => importUnits(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
  }
});
