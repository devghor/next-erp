import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createChallan, finalizeChallan } from './service';
import { challanKeys } from './queries';
import type { CreateChallanPayload, FinalizeChallanPayload } from './types';

export const createChallanMutation = mutationOptions({
  mutationFn: (data: CreateChallanPayload) => createChallan(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: challanKeys.all });
  }
});

export const finalizeChallanMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: number; data: FinalizeChallanPayload }) => finalizeChallan(id, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: challanKeys.all });
  }
});
