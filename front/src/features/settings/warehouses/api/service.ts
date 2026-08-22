// ============================================================
// Warehouse Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Warehouse,
  WarehouseFilters,
  WarehousesResponse,
  WarehouseMutationPayload,
  ImportResult
} from './types';

const BASE = '/settings/warehouses';

function toParams(filters: WarehouseFilters) {
  return {
    id: filters.id,
    name: filters.name,
    phone: filters.phone,
    email: filters.email,
    address: filters.address,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getWarehouses(filters: WarehouseFilters): Promise<WarehousesResponse> {
  return apiClient<WarehousesResponse>(BASE, { params: toParams(filters) });
}

export async function createWarehouse(data: WarehouseMutationPayload): Promise<Warehouse> {
  const res = await apiClient<{ data: Warehouse }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateWarehouse(
  id: number,
  data: WarehouseMutationPayload
): Promise<Warehouse> {
  const res = await apiClient<{ data: Warehouse }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteWarehouse(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteWarehouses(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportWarehousesPdf(filters: WarehouseFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportWarehousesExcel(filters: WarehouseFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importWarehouses(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  // Content-Type must be cleared so axios lets the browser set the
  // multipart boundary itself — otherwise the instance's default
  // 'application/json' header makes axios JSON-stringify the FormData.
  return apiClient<ImportResult>(`${BASE}/import`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': null }
  });
}
