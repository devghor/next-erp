// ============================================================
// Customer Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Customer,
  CustomerFilters,
  CustomersResponse,
  CustomerMutationPayload,
  ImportResult
} from './types';

const BASE = '/people/customers';

function toParams(filters: CustomerFilters) {
  return {
    id: filters.id,
    name: filters.name,
    company_name: filters.company_name,
    phone: filters.phone,
    email: filters.email,
    address: filters.address,
    city: filters.city,
    state: filters.state,
    postal_code: filters.postal_code,
    country: filters.country,
    tax_number: filters.tax_number,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getCustomers(filters: CustomerFilters): Promise<CustomersResponse> {
  return apiClient<CustomersResponse>(BASE, { params: toParams(filters) });
}

export async function createCustomer(data: CustomerMutationPayload): Promise<Customer> {
  const res = await apiClient<{ data: Customer }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateCustomer(
  id: number,
  data: CustomerMutationPayload
): Promise<Customer> {
  const res = await apiClient<{ data: Customer }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteCustomers(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportCustomersPdf(filters: CustomerFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportCustomersExcel(filters: CustomerFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importCustomers(file: File): Promise<ImportResult> {
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
