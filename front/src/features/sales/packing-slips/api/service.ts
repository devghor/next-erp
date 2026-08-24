// ============================================================
// Packing Slip Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  PackingSlip,
  PackingSlipFilters,
  PackingSlipsResponse,
  PackingSlipMutationPayload,
  AvailableSaleLine
} from './types';

const BASE = '/sale/packing-slips';

function toParams(filters: PackingSlipFilters) {
  return {
    reference_no: filters.reference_no,
    sale_id: filters.sale_id,
    status: filters.status,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getPackingSlips(filters: PackingSlipFilters): Promise<PackingSlipsResponse> {
  return apiClient<PackingSlipsResponse>(BASE, { params: toParams(filters) });
}

export async function createPackingSlip(data: PackingSlipMutationPayload): Promise<PackingSlip> {
  const res = await apiClient<{ data: PackingSlip }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function deletePackingSlip(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function getAvailableSaleLines(saleId: number): Promise<AvailableSaleLine[]> {
  const res = await apiClient<{ data: AvailableSaleLine[] }>(`${BASE}/available-lines/${saleId}`);
  return res.data;
}
