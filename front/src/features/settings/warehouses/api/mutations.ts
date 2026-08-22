import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  bulkDeleteWarehouses,
  importWarehouses
} from './service';
import { warehouseKeys } from './queries';
import type { WarehouseMutationPayload } from './types';

export const createWarehouseMutation = mutationOptions({
  mutationFn: (data: WarehouseMutationPayload) => createWarehouse(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
  }
});

export const updateWarehouseMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: WarehouseMutationPayload }) =>
    updateWarehouse(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
  }
});

export const deleteWarehouseMutation = mutationOptions({
  mutationFn: (id: number) => deleteWarehouse(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
  }
});

export const bulkDeleteWarehousesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteWarehouses(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
  }
});

export const importWarehousesMutation = mutationOptions({
  mutationFn: (file: File) => importWarehouses(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
  }
});
