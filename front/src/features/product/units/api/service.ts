// ============================================================
// Unit Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Unit,
  UnitFilters,
  UnitsResponse,
  UnitMutationPayload,
  ImportResult
} from './types';

const BASE = '/product/units';

function toParams(filters: UnitFilters) {
  return {
    id: filters.id,
    code: filters.code,
    name: filters.name,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getUnits(filters: UnitFilters): Promise<UnitsResponse> {
  return apiClient<UnitsResponse>(BASE, { params: toParams(filters) });
}

export async function createUnit(data: UnitMutationPayload): Promise<Unit> {
  const res = await apiClient<{ data: Unit }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateUnit(id: number, data: UnitMutationPayload): Promise<Unit> {
  const res = await apiClient<{ data: Unit }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteUnit(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteUnits(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportUnitsPdf(filters: UnitFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportUnitsExcel(filters: UnitFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importUnits(file: File): Promise<ImportResult> {
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
