// ============================================================
// Tax Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { Tax, TaxFilters, TaxesResponse, TaxMutationPayload, ImportResult } from './types';

const BASE = '/settings/taxes';

function toParams(filters: TaxFilters) {
  return {
    id: filters.id,
    name: filters.name,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getTaxes(filters: TaxFilters): Promise<TaxesResponse> {
  return apiClient<TaxesResponse>(BASE, { params: toParams(filters) });
}

export async function createTax(data: TaxMutationPayload): Promise<Tax> {
  const res = await apiClient<{ data: Tax }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateTax(id: number, data: TaxMutationPayload): Promise<Tax> {
  const res = await apiClient<{ data: Tax }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteTax(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteTaxes(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportTaxesPdf(filters: TaxFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportTaxesExcel(filters: TaxFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importTaxes(file: File): Promise<ImportResult> {
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
