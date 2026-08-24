import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { payInstallment } from './service';
import { installmentPlanKeys } from './queries';
import type { PayInstallmentPayload } from './types';

export const payInstallmentMutation = mutationOptions({
  mutationFn: ({ installmentId, data }: { installmentId: number; data: PayInstallmentPayload }) => payInstallment(installmentId, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: installmentPlanKeys.all });
  }
});
