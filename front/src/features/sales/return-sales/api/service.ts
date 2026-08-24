// ============================================================
// Sale Return Service — Data Access Layer
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  SaleReturn,
  SaleReturnFilters,
  SaleReturnsResponse,
  SaleReturnMutationPayload,
  AvailableReturnLine
} from './types';

const BASE = '/sale/sale-returns';

function toParams(filters: SaleReturnFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    sale_id: filters.sale_id,
    customer_id: filters.customer_id,
    warehouse_id: filters.warehouse_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getSaleReturns(filters: SaleReturnFilters): Promise<SaleReturnsResponse> {
  return apiClient<SaleReturnsResponse>(BASE, { params: toParams(filters) });
}

export async function getSaleReturn(id: number): Promise<SaleReturn> {
  const res = await apiClient<{ data: SaleReturn }>(`${BASE}/${id}`);
  return res.data;
}

export async function createSaleReturn(data: SaleReturnMutationPayload): Promise<SaleReturn> {
  const res = await apiClient<{ data: SaleReturn }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function deleteSaleReturn(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function getAvailableReturnLines(saleId: number): Promise<AvailableReturnLine[]> {
  const res = await apiClient<{ data: AvailableReturnLine[] }>(`${BASE}/available-lines/${saleId}`);
  return res.data;
}
