import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createSaleReturn, deleteSaleReturn } from './service';
import { saleReturnKeys } from './queries';
import type { SaleReturnMutationPayload } from './types';

export const createSaleReturnMutation = mutationOptions({
  mutationFn: (data: SaleReturnMutationPayload) => createSaleReturn(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleReturnKeys.all });
  }
});

export const deleteSaleReturnMutation = mutationOptions({
  mutationFn: (id: number) => deleteSaleReturn(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleReturnKeys.all });
  }
});
