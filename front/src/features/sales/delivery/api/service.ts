// ============================================================
// Delivery Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Delivery,
  DeliveryFilters,
  DeliveriesResponse,
  DeliveryMutationPayload,
  DeliveryUpdatePayload
} from './types';

const BASE = '/sale/deliveries';

function toParams(filters: DeliveryFilters) {
  return {
    id: filters.id,
    reference_no: filters.reference_no,
    sale_id: filters.sale_id,
    courier_id: filters.courier_id,
    status: filters.status,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getDeliveries(filters: DeliveryFilters): Promise<DeliveriesResponse> {
  return apiClient<DeliveriesResponse>(BASE, { params: toParams(filters) });
}

export async function createDelivery(data: DeliveryMutationPayload): Promise<Delivery> {
  const res = await apiClient<{ data: Delivery }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateDelivery(
  id: number,
  data: DeliveryUpdatePayload
): Promise<Delivery> {
  const res = await apiClient<{ data: Delivery }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteDelivery(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteDeliveries(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function trackDelivery(id: number): Promise<Delivery> {
  const res = await apiClient<{ data: Delivery }>(`${BASE}/${id}/track`);
  return res.data;
}
