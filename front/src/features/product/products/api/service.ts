// ============================================================
// Product Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  ProductMutationPayload,
  ProductHistory,
  ImportResult
} from './types';

const BASE = '/product/products';

function toParams(filters: ProductFilters) {
  return {
    id: filters.id,
    name: filters.name,
    category_id: filters.category_id,
    brand_id: filters.brand_id,
    unit_id: filters.unit_id,
    tax_id: filters.tax_id,
    type: filters.type,
    stock_filter: filters.stock_filter,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

/** Appends a possibly-nested value onto FormData using bracket notation. */
function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;

  if (value instanceof File) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormValue(formData, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) =>
      appendFormValue(formData, `${key}[${nestedKey}]`, nestedValue)
    );
    return;
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0');
    return;
  }

  formData.append(key, String(value));
}

function toFormData(data: ProductMutationPayload): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => appendFormValue(formData, key, value));
  return formData;
}

export async function getProducts(filters: ProductFilters): Promise<ProductsResponse> {
  return apiClient<ProductsResponse>(BASE, { params: toParams(filters) });
}

export async function getProduct(id: number): Promise<Product> {
  const res = await apiClient<{ data: Product }>(`${BASE}/${id}`);
  return res.data;
}

export async function createProduct(data: ProductMutationPayload): Promise<Product> {
  const res = await apiClient<{ data: Product }>(BASE, {
    method: 'POST',
    data: toFormData(data),
    headers: { 'Content-Type': null }
  });
  return res.data;
}

export async function updateProduct(id: number, data: ProductMutationPayload): Promise<Product> {
  const formData = toFormData(data);
  formData.append('_method', 'PUT');
  const res = await apiClient<{ data: Product }>(`${BASE}/${id}`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': null }
  });
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteProducts(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportProductsPdf(filters: ProductFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, { params: toParams(filters), responseType: 'blob' });
}

export async function exportProductsExcel(filters: ProductFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, { params: toParams(filters), responseType: 'blob' });
}

export async function importProducts(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient<ImportResult>(`${BASE}/import`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': null }
  });
}

export async function getProductHistory(id: number): Promise<ProductHistory> {
  return apiClient<ProductHistory>(`${BASE}/${id}/history`);
}

export async function printProductBarcode(id: number, qty: number): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/${id}/print-barcode`, { params: { qty }, responseType: 'blob' });
}
