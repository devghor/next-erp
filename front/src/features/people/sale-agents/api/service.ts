// ============================================================
// Sale Agent Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  SaleAgent,
  SaleAgentFilters,
  SaleAgentsResponse,
  SaleAgentMutationPayload,
  ImportResult
} from './types';

const BASE = '/people/sale-agents';

function toParams(filters: SaleAgentFilters) {
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

export async function getSaleAgents(filters: SaleAgentFilters): Promise<SaleAgentsResponse> {
  return apiClient<SaleAgentsResponse>(BASE, { params: toParams(filters) });
}

export async function createSaleAgent(data: SaleAgentMutationPayload): Promise<SaleAgent> {
  const res = await apiClient<{ data: SaleAgent }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateSaleAgent(
  id: number,
  data: SaleAgentMutationPayload
): Promise<SaleAgent> {
  const res = await apiClient<{ data: SaleAgent }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteSaleAgent(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteSaleAgents(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportSaleAgentsPdf(filters: SaleAgentFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportSaleAgentsExcel(filters: SaleAgentFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importSaleAgents(file: File): Promise<ImportResult> {
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
