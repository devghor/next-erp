// ============================================================
// Quotation Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Quotation,
  QuotationFilters,
  QuotationsResponse,
  QuotationMutationPayload
} from './types';

const BASE = '/quotation/quotations';

function toParams(filters: QuotationFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    customer_id: filters.customer_id,
    warehouse_id: filters.warehouse_id,
    quotation_status: filters.quotation_status,
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

function toFormData(data: QuotationMutationPayload): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => appendFormValue(formData, key, value));
  return formData;
}

export async function getQuotations(filters: QuotationFilters): Promise<QuotationsResponse> {
  return apiClient<QuotationsResponse>(BASE, { params: toParams(filters) });
}

export async function getQuotation(id: number): Promise<Quotation> {
  const res = await apiClient<{ data: Quotation }>(`${BASE}/${id}`);
  return res.data;
}

export async function createQuotation(data: QuotationMutationPayload): Promise<Quotation> {
  const res = await apiClient<{ data: Quotation }>(BASE, {
    method: 'POST',
    data: toFormData(data),
    headers: { 'Content-Type': null }
  });
  return res.data;
}

export async function updateQuotation(
  id: number,
  data: QuotationMutationPayload
): Promise<Quotation> {
  const formData = toFormData(data);
  formData.append('_method', 'PUT');
  const res = await apiClient<{ data: Quotation }>(`${BASE}/${id}`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': null }
  });
  return res.data;
}

export async function deleteQuotation(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteQuotations(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportQuotationsPdf(filters: QuotationFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, { params: toParams(filters), responseType: 'blob' });
}

export async function exportQuotationsExcel(filters: QuotationFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function sendQuotationMail(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}/send-mail`, { method: 'POST' });
}
