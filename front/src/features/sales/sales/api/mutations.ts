import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createSale,
  updateSale,
  deleteSale,
  bulkDeleteSales,
  addSalePayment,
  importSaleCsv
} from './service';
import { saleKeys } from './queries';
import type { SaleMutationPayload, SalePaymentInput, SaleCsvImportPayload } from './types';

export const createSaleMutation = mutationOptions({
  mutationFn: (data: SaleMutationPayload) => createSale(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const updateSaleMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: SaleMutationPayload }) => updateSale(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const deleteSaleMutation = mutationOptions({
  mutationFn: (id: number) => deleteSale(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const bulkDeleteSalesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteSales(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const addSalePaymentMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: SalePaymentInput }) => addSalePayment(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const importSaleCsvMutation = mutationOptions({
  mutationFn: (payload: SaleCsvImportPayload) => importSaleCsv(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});
