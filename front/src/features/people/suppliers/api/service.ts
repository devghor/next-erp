// ============================================================
// Supplier Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Supplier,
  SupplierFilters,
  SuppliersResponse,
  SupplierMutationPayload,
  ImportResult
} from './types';

const BASE = '/people/suppliers';

function toParams(filters: SupplierFilters) {
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

export async function getSuppliers(filters: SupplierFilters): Promise<SuppliersResponse> {
  return apiClient<SuppliersResponse>(BASE, { params: toParams(filters) });
}

export async function createSupplier(data: SupplierMutationPayload): Promise<Supplier> {
  const res = await apiClient<{ data: Supplier }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateSupplier(
  id: number,
  data: SupplierMutationPayload
): Promise<Supplier> {
  const res = await apiClient<{ data: Supplier }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteSuppliers(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportSuppliersPdf(filters: SupplierFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportSuppliersExcel(filters: SupplierFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importSuppliers(file: File): Promise<ImportResult> {
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
