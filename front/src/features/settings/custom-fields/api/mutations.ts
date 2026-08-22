import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createCustomField,
  updateCustomField,
  deleteCustomField,
  bulkDeleteCustomFields
} from './service';
import { customFieldKeys } from './queries';
import type { CustomFieldMutationPayload } from './types';

export const createCustomFieldMutation = mutationOptions({
  mutationFn: (data: CustomFieldMutationPayload) => createCustomField(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
  }
});

export const updateCustomFieldMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CustomFieldMutationPayload }) =>
    updateCustomField(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
  }
});

export const deleteCustomFieldMutation = mutationOptions({
  mutationFn: (id: number) => deleteCustomField(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
  }
});

export const bulkDeleteCustomFieldsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteCustomFields(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
  }
});
