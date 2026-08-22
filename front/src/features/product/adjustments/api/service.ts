// ============================================================
// Adjustment Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Adjustment,
  AdjustmentFilters,
  AdjustmentsResponse,
  AdjustmentMutationPayload
} from './types';

const BASE = '/product/adjustments';

function toParams(filters: AdjustmentFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    warehouse_id: filters.warehouse_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getAdjustments(filters: AdjustmentFilters): Promise<AdjustmentsResponse> {
  return apiClient<AdjustmentsResponse>(BASE, { params: toParams(filters) });
}

export async function getAdjustment(id: number): Promise<Adjustment> {
  const res = await apiClient<{ data: Adjustment }>(`${BASE}/${id}`);
  return res.data;
}

export async function createAdjustment(data: AdjustmentMutationPayload): Promise<Adjustment> {
  const res = await apiClient<{ data: Adjustment }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateAdjustment(
  id: number,
  data: AdjustmentMutationPayload
): Promise<Adjustment> {
  const res = await apiClient<{ data: Adjustment }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteAdjustment(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteAdjustments(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}
