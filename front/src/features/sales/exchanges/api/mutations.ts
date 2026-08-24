import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createSaleExchange } from './service';
import { saleExchangeKeys } from './queries';
import type { SaleExchangeMutationPayload } from './types';

export const createSaleExchangeMutation = mutationOptions({
  mutationFn: (data: SaleExchangeMutationPayload) => createSaleExchange(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleExchangeKeys.all });
  }
});
