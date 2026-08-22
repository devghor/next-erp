// ============================================================
// Custom Field Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  CustomField,
  CustomFieldFilters,
  CustomFieldsResponse,
  CustomFieldMutationPayload
} from './types';

const BASE = '/settings/custom-fields';

function toParams(filters: CustomFieldFilters) {
  return {
    id: filters.id,
    belongs_to: filters.belongs_to,
    name: filters.name,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getCustomFields(
  filters: CustomFieldFilters
): Promise<CustomFieldsResponse> {
  return apiClient<CustomFieldsResponse>(BASE, { params: toParams(filters) });
}

export async function createCustomField(
  data: CustomFieldMutationPayload
): Promise<CustomField> {
  const res = await apiClient<{ data: CustomField }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateCustomField(
  id: number,
  data: CustomFieldMutationPayload
): Promise<CustomField> {
  const res = await apiClient<{ data: CustomField }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteCustomField(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteCustomFields(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}
