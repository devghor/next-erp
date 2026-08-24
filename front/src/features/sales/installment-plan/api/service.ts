import { apiClient } from '@/lib/api-client';
import type { Installment, InstallmentPlan, InstallmentPlanFilters, InstallmentPlansResponse, PayInstallmentPayload } from './types';

const BASE = '/sale/installment-plans';

export async function getInstallmentPlans(filters: InstallmentPlanFilters): Promise<InstallmentPlansResponse> {
  return apiClient<InstallmentPlansResponse>(BASE, { params: filters });
}

export async function getInstallmentPlan(id: number): Promise<InstallmentPlan> {
  const res = await apiClient<{ data: InstallmentPlan }>(`${BASE}/${id}`);
  return res.data;
}

export async function payInstallment(installmentId: number, data: PayInstallmentPayload): Promise<Installment> {
  const res = await apiClient<{ data: Installment }>(`${BASE}/installments/${installmentId}/pay`, { method: 'POST', data });
  return res.data;
}
