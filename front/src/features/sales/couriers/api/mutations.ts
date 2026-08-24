import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createCourier,
  updateCourier,
  deleteCourier,
  bulkDeleteCouriers,
  importCouriers
} from './service';
import { courierKeys } from './queries';
import type { CourierMutationPayload } from './types';

export const createCourierMutation = mutationOptions({
  mutationFn: (data: CourierMutationPayload) => createCourier(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
  }
});

export const updateCourierMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CourierMutationPayload }) =>
    updateCourier(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
  }
});

export const deleteCourierMutation = mutationOptions({
  mutationFn: (id: number) => deleteCourier(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
  }
});

export const bulkDeleteCouriersMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteCouriers(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
  }
});

export const importCouriersMutation = mutationOptions({
  mutationFn: (file: File) => importCouriers(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
  }
});
