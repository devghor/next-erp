import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createRole, updateRole, deleteRole, bulkDeleteRoles, importRoles } from './service';
import { roleKeys } from './queries';
import type { RoleMutationPayload } from './types';

export const createRoleMutation = mutationOptions({
  mutationFn: (data: RoleMutationPayload) => createRole(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});

export const updateRoleMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: RoleMutationPayload }) =>
    updateRole(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});

export const deleteRoleMutation = mutationOptions({
  mutationFn: (id: number) => deleteRole(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});

export const bulkDeleteRolesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteRoles(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});

export const importRolesMutation = mutationOptions({
  mutationFn: (file: File) => importRoles(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
  }
});
