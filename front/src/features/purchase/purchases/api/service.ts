// ============================================================
// Purchase Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Purchase,
  PurchaseFilters,
  PurchasesResponse,
  PurchaseMutationPayload,
  PurchaseCsvImportPayload
} from './types';

const BASE = '/purchase/purchases';

function toParams(filters: PurchaseFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    supplier_id: filters.supplier_id,
    warehouse_id: filters.warehouse_id,
    status: filters.status,
    payment_status: filters.payment_status,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getPurchases(filters: PurchaseFilters): Promise<PurchasesResponse> {
  return apiClient<PurchasesResponse>(BASE, { params: toParams(filters) });
}

export async function getPurchase(id: number): Promise<Purchase> {
  const res = await apiClient<{ data: Purchase }>(`${BASE}/${id}`);
  return res.data;
}

export async function createPurchase(data: PurchaseMutationPayload): Promise<Purchase> {
  const res = await apiClient<{ data: Purchase }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updatePurchase(id: number, data: PurchaseMutationPayload): Promise<Purchase> {
  const res = await apiClient<{ data: Purchase }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deletePurchase(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeletePurchases(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportPurchasesPdf(filters: PurchaseFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, { params: toParams(filters), responseType: 'blob' });
}

export async function exportPurchasesExcel(filters: PurchaseFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importPurchaseCsv(payload: PurchaseCsvImportPayload): Promise<Purchase> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('warehouse_id', String(payload.warehouse_id));
  if (payload.supplier_id) formData.append('supplier_id', String(payload.supplier_id));
  if (payload.status) formData.append('status', payload.status);
  if (payload.order_tax !== undefined) formData.append('order_tax', String(payload.order_tax));
  if (payload.paid_amount !== undefined)
    formData.append('paid_amount', String(payload.paid_amount));
  if (payload.paying_method) formData.append('paying_method', payload.paying_method);
  if (payload.note) formData.append('note', payload.note);

  const res = await apiClient<{ data: Purchase }>(`${BASE}/import`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': undefined }
  });
  return res.data;
}
