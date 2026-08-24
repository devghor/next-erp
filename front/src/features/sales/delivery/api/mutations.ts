import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createDelivery,
  updateDelivery,
  deleteDelivery,
  bulkDeleteDeliveries,
  trackDelivery
} from './service';
import { deliveryKeys } from './queries';
import type { DeliveryMutationPayload, DeliveryUpdatePayload } from './types';

export const createDeliveryMutation = mutationOptions({
  mutationFn: (data: DeliveryMutationPayload) => createDelivery(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
  }
});

export const updateDeliveryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: DeliveryUpdatePayload }) =>
    updateDelivery(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
  }
});

export const deleteDeliveryMutation = mutationOptions({
  mutationFn: (id: number) => deleteDelivery(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
  }
});

export const bulkDeleteDeliveriesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteDeliveries(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
  }
});

export const trackDeliveryMutation = mutationOptions({
  mutationFn: (id: number) => trackDelivery(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
  }
});
