import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createQuotation,
  updateQuotation,
  deleteQuotation,
  bulkDeleteQuotations,
  sendQuotationMail
} from './service';
import { quotationKeys } from './queries';
import type { QuotationMutationPayload } from './types';

export const createQuotationMutation = mutationOptions({
  mutationFn: (data: QuotationMutationPayload) => createQuotation(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
  }
});

export const updateQuotationMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: QuotationMutationPayload }) =>
    updateQuotation(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
  }
});

export const deleteQuotationMutation = mutationOptions({
  mutationFn: (id: number) => deleteQuotation(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
  }
});

export const bulkDeleteQuotationsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteQuotations(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
  }
});

export const sendQuotationMailMutation = mutationOptions({
  mutationFn: (id: number) => sendQuotationMail(id)
});
