// ============================================================
// Damage Stock Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  DamageStock,
  DamageStockFilters,
  DamageStocksResponse,
  DamageStockMutationPayload
} from './types';

const BASE = '/product/damage-stocks';

function toParams(filters: DamageStockFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    warehouse_id: filters.warehouse_id,
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

  formData.append(key, String(value));
}

function toFormData(data: DamageStockMutationPayload): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => appendFormValue(formData, key, value));
  return formData;
}

export async function getDamageStocks(filters: DamageStockFilters): Promise<DamageStocksResponse> {
  return apiClient<DamageStocksResponse>(BASE, { params: toParams(filters) });
}

export async function getDamageStock(id: number): Promise<DamageStock> {
  const res = await apiClient<{ data: DamageStock }>(`${BASE}/${id}`);
  return res.data;
}

export async function createDamageStock(data: DamageStockMutationPayload): Promise<DamageStock> {
  const res = await apiClient<{ data: DamageStock }>(BASE, {
    method: 'POST',
    data: toFormData(data),
    headers: { 'Content-Type': null }
  });
  return res.data;
}

export async function updateDamageStock(
  id: number,
  data: DamageStockMutationPayload
): Promise<DamageStock> {
  const formData = toFormData(data);
  formData.append('_method', 'PUT');
  const res = await apiClient<{ data: DamageStock }>(`${BASE}/${id}`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': null }
  });
  return res.data;
}

export async function deleteDamageStock(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteDamageStocks(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}
