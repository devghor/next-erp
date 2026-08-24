// ============================================================
// Courier Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Courier,
  CourierFilters,
  CouriersResponse,
  CourierMutationPayload,
  ImportResult
} from './types';

const BASE = '/sale/couriers';

function toParams(filters: CourierFilters) {
  return {
    id: filters.id,
    name: filters.name,
    type: filters.type,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getCouriers(filters: CourierFilters): Promise<CouriersResponse> {
  return apiClient<CouriersResponse>(BASE, { params: toParams(filters) });
}

export async function createCourier(data: CourierMutationPayload): Promise<Courier> {
  const res = await apiClient<{ data: Courier }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateCourier(
  id: number,
  data: CourierMutationPayload
): Promise<Courier> {
  const res = await apiClient<{ data: Courier }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteCourier(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteCouriers(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportCouriersPdf(filters: CourierFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportCouriersExcel(filters: CourierFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importCouriers(file: File): Promise<ImportResult> {
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
