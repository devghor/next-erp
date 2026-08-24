// ============================================================
// Biller Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Biller,
  BillerFilters,
  BillersResponse,
  BillerMutationPayload,
  ImportResult
} from './types';

const BASE = '/people/billers';

function toParams(filters: BillerFilters) {
  return {
    id: filters.id,
    name: filters.name,
    company_name: filters.company_name,
    phone: filters.phone,
    email: filters.email,
    address: filters.address,
    city: filters.city,
    country: filters.country,
    vat_number: filters.vat_number,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getBillers(filters: BillerFilters): Promise<BillersResponse> {
  return apiClient<BillersResponse>(BASE, { params: toParams(filters) });
}

export async function createBiller(data: BillerMutationPayload): Promise<Biller> {
  const res = await apiClient<{ data: Biller }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateBiller(id: number, data: BillerMutationPayload): Promise<Biller> {
  const res = await apiClient<{ data: Biller }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteBiller(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteBillers(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportBillersPdf(filters: BillerFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportBillersExcel(filters: BillerFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importBillers(file: File): Promise<ImportResult> {
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
