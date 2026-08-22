// ============================================================
// Barcode Setting Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  BarcodeSetting,
  BarcodeSettingFilters,
  BarcodeSettingsResponse,
  BarcodeSettingMutationPayload
} from './types';

const BASE = '/product/barcode-settings';

function toParams(filters: BarcodeSettingFilters) {
  return {
    name: filters.name,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getBarcodeSettings(
  filters: BarcodeSettingFilters
): Promise<BarcodeSettingsResponse> {
  return apiClient<BarcodeSettingsResponse>(BASE, { params: toParams(filters) });
}

export async function createBarcodeSetting(
  data: BarcodeSettingMutationPayload
): Promise<BarcodeSetting> {
  const res = await apiClient<{ data: BarcodeSetting }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateBarcodeSetting(
  id: number,
  data: BarcodeSettingMutationPayload
): Promise<BarcodeSetting> {
  const res = await apiClient<{ data: BarcodeSetting }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteBarcodeSetting(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteBarcodeSettings(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function setDefaultBarcodeSetting(id: number): Promise<BarcodeSetting> {
  const res = await apiClient<{ data: BarcodeSetting }>(`${BASE}/${id}/set-default`, {
    method: 'PUT'
  });
  return res.data;
}
