import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  bulkDeleteSuppliers,
  importSuppliers
} from './service';
import { supplierKeys } from './queries';
import type { SupplierMutationPayload } from './types';

export const createSupplierMutation = mutationOptions({
  mutationFn: (data: SupplierMutationPayload) => createSupplier(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});

export const updateSupplierMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: SupplierMutationPayload }) =>
    updateSupplier(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});

export const deleteSupplierMutation = mutationOptions({
  mutationFn: (id: number) => deleteSupplier(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});

export const bulkDeleteSuppliersMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteSuppliers(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});

export const importSuppliersMutation = mutationOptions({
  mutationFn: (file: File) => importSuppliers(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});
