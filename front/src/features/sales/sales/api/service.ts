// ============================================================
// Sale Service — Data Access Layer
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Sale,
  SaleFilters,
  SalesResponse,
  SaleMutationPayload,
  SalePaymentInput,
  SaleCsvImportPayload
} from './types';

const BASE = '/sale/sales';

function toParams(filters: SaleFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    customer_id: filters.customer_id,
    warehouse_id: filters.warehouse_id,
    sale_status: filters.sale_status,
    payment_status: filters.payment_status,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getSales(filters: SaleFilters): Promise<SalesResponse> {
  return apiClient<SalesResponse>(BASE, { params: toParams(filters) });
}

export async function getSale(id: number): Promise<Sale> {
  const res = await apiClient<{ data: Sale }>(`${BASE}/${id}`);
  return res.data;
}

export async function createSale(data: SaleMutationPayload): Promise<Sale> {
  const res = await apiClient<{ data: Sale }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateSale(id: number, data: SaleMutationPayload): Promise<Sale> {
  const res = await apiClient<{ data: Sale }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteSale(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteSales(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function addSalePayment(id: number, data: SalePaymentInput): Promise<Sale> {
  const res = await apiClient<{ data: Sale }>(`${BASE}/${id}/add-payment`, { method: 'POST', data });
  return res.data;
}

export async function importSaleCsv(payload: SaleCsvImportPayload): Promise<Sale> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('customer_id', String(payload.customer_id));
  formData.append('warehouse_id', String(payload.warehouse_id));
  if (payload.biller_id) formData.append('biller_id', String(payload.biller_id));
  if (payload.currency_id) formData.append('currency_id', String(payload.currency_id));
  if (payload.sale_status) formData.append('sale_status', payload.sale_status);

  const res = await apiClient<{ data: Sale }>(`${BASE}/import`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': undefined }
  });
  return res.data;
}

export async function exportSalesPdf(filters: SaleFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, { params: toParams(filters), responseType: 'blob' });
}

export async function exportSalesExcel(filters: SaleFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, { params: toParams(filters), responseType: 'blob' });
}
