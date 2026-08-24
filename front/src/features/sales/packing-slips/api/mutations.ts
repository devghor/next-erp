import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createPackingSlip, deletePackingSlip } from './service';
import { packingSlipKeys } from './queries';
import type { PackingSlipMutationPayload } from './types';

export const createPackingSlipMutation = mutationOptions({
  mutationFn: (data: PackingSlipMutationPayload) => createPackingSlip(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packingSlipKeys.all });
  }
});

export const deletePackingSlipMutation = mutationOptions({
  mutationFn: (id: number) => deletePackingSlip(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packingSlipKeys.all });
  }
});
