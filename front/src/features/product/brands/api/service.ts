// ============================================================
// Brand Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { Brand, BrandFilters, BrandsResponse, BrandMutationPayload, ImportResult } from './types';

const BASE = '/product/brands';

function toParams(filters: BrandFilters) {
  return {
    id: filters.id,
    name: filters.name,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getBrands(filters: BrandFilters): Promise<BrandsResponse> {
  return apiClient<BrandsResponse>(BASE, { params: toParams(filters) });
}

function toFormData(data: BrandMutationPayload): FormData {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.image) formData.append('image', data.image);
  return formData;
}

export async function createBrand(data: BrandMutationPayload): Promise<Brand> {
  if (data.image) {
    const res = await apiClient<{ data: Brand }>(BASE, {
      method: 'POST',
      data: toFormData(data),
      headers: { 'Content-Type': null }
    });
    return res.data;
  }

  const res = await apiClient<{ data: Brand }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateBrand(id: number, data: BrandMutationPayload): Promise<Brand> {
  if (data.image) {
    // Laravel doesn't parse multipart bodies on PUT, so spoof the method
    // via `_method` on a POST request instead — same trick as classic
    // Laravel form uploads.
    const formData = toFormData(data);
    formData.append('_method', 'PUT');
    const res = await apiClient<{ data: Brand }>(`${BASE}/${id}`, {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': null }
    });
    return res.data;
  }

  const res = await apiClient<{ data: Brand }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteBrand(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteBrands(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportBrandsPdf(filters: BrandFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportBrandsExcel(filters: BrandFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importBrands(file: File): Promise<ImportResult> {
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
