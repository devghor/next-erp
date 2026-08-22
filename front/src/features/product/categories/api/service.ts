// ============================================================
// Category Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Category,
  CategoryFilters,
  CategoriesResponse,
  CategoryMutationPayload,
  ImportResult
} from './types';

const BASE = '/product/categories';

function toParams(filters: CategoryFilters) {
  return {
    id: filters.id,
    name: filters.name,
    parent_id: filters.parent_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getCategories(filters: CategoryFilters): Promise<CategoriesResponse> {
  return apiClient<CategoriesResponse>(BASE, { params: toParams(filters) });
}

function toFormData(data: CategoryMutationPayload): FormData {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.parent_id != null) formData.append('parent_id', String(data.parent_id));
  if (data.image) formData.append('image', data.image);
  return formData;
}

export async function createCategory(data: CategoryMutationPayload): Promise<Category> {
  if (data.image) {
    const res = await apiClient<{ data: Category }>(BASE, {
      method: 'POST',
      data: toFormData(data),
      headers: { 'Content-Type': null }
    });
    return res.data;
  }

  const res = await apiClient<{ data: Category }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateCategory(
  id: number,
  data: CategoryMutationPayload
): Promise<Category> {
  if (data.image) {
    // Laravel doesn't parse multipart bodies on PUT, so spoof the method
    // via `_method` on a POST request instead — same trick as classic
    // Laravel form uploads.
    const formData = toFormData(data);
    formData.append('_method', 'PUT');
    const res = await apiClient<{ data: Category }>(`${BASE}/${id}`, {
      method: 'POST',
      data: formData,
      headers: { 'Content-Type': null }
    });
    return res.data;
  }

  const res = await apiClient<{ data: Category }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteCategories(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportCategoriesPdf(filters: CategoryFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportCategoriesExcel(filters: CategoryFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importCategories(file: File): Promise<ImportResult> {
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
