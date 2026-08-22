// ============================================================
// Currency Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Currency,
  CurrencyFilters,
  CurrenciesResponse,
  CurrencyMutationPayload,
  ImportResult
} from './types';

const BASE = '/settings/currencies';

function toParams(filters: CurrencyFilters) {
  return {
    id: filters.id,
    name: filters.name,
    code: filters.code,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getCurrencies(filters: CurrencyFilters): Promise<CurrenciesResponse> {
  return apiClient<CurrenciesResponse>(BASE, { params: toParams(filters) });
}

export async function createCurrency(data: CurrencyMutationPayload): Promise<Currency> {
  const res = await apiClient<{ data: Currency }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateCurrency(
  id: number,
  data: CurrencyMutationPayload
): Promise<Currency> {
  const res = await apiClient<{ data: Currency }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteCurrency(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteCurrencies(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportCurrenciesPdf(filters: CurrencyFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportCurrenciesExcel(filters: CurrencyFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importCurrencies(file: File): Promise<ImportResult> {
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
