import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createSaleAgent,
  updateSaleAgent,
  deleteSaleAgent,
  bulkDeleteSaleAgents,
  importSaleAgents
} from './service';
import { saleAgentKeys } from './queries';
import type { SaleAgentMutationPayload } from './types';

export const createSaleAgentMutation = mutationOptions({
  mutationFn: (data: SaleAgentMutationPayload) => createSaleAgent(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
  }
});

export const updateSaleAgentMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: SaleAgentMutationPayload }) =>
    updateSaleAgent(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
  }
});

export const deleteSaleAgentMutation = mutationOptions({
  mutationFn: (id: number) => deleteSaleAgent(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
  }
});

export const bulkDeleteSaleAgentsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteSaleAgents(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
  }
});

export const importSaleAgentsMutation = mutationOptions({
  mutationFn: (file: File) => importSaleAgents(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
  }
});
