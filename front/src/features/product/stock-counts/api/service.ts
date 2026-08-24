// ============================================================
// Stock Count Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  StockCount,
  StockCountFilters,
  StockCountsResponse,
  StockCountCreatePayload,
  StockCountUpdatePayload,
  StockCountSubmitPayload
} from './types';

const BASE = '/product/stock-counts';

function toParams(filters: StockCountFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    warehouse_id: filters.warehouse_id,
    status: filters.status,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getStockCounts(filters: StockCountFilters): Promise<StockCountsResponse> {
  return apiClient<StockCountsResponse>(BASE, { params: toParams(filters) });
}

export async function getStockCount(id: number): Promise<StockCount> {
  const res = await apiClient<{ data: StockCount }>(`${BASE}/${id}`);
  return res.data;
}

export async function createStockCount(data: StockCountCreatePayload): Promise<StockCount> {
  const res = await apiClient<{ data: StockCount }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateStockCount(
  id: number,
  data: StockCountUpdatePayload
): Promise<StockCount> {
  const res = await apiClient<{ data: StockCount }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function submitStockCount(
  id: number,
  data: StockCountSubmitPayload
): Promise<StockCount> {
  const res = await apiClient<{ data: StockCount }>(`${BASE}/${id}/submit-count`, {
    method: 'POST',
    data
  });
  return res.data;
}

export async function adjustStockCount(id: number): Promise<StockCount> {
  const res = await apiClient<{ data: StockCount }>(`${BASE}/${id}/adjust`, { method: 'POST' });
  return res.data;
}

export async function deleteStockCount(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteStockCounts(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}
