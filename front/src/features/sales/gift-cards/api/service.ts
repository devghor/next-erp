// ============================================================
// Gift Card Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  GiftCard,
  GiftCardFilters,
  GiftCardsResponse,
  GiftCardMutationPayload
} from './types';

const BASE = '/sale/gift-cards';

function toParams(filters: GiftCardFilters) {
  return {
    id: filters.id,
    card_no: filters.card_no,
    customer_id: filters.customer_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getGiftCards(filters: GiftCardFilters): Promise<GiftCardsResponse> {
  return apiClient<GiftCardsResponse>(BASE, { params: toParams(filters) });
}

export async function createGiftCard(data: GiftCardMutationPayload): Promise<GiftCard> {
  const res = await apiClient<{ data: GiftCard }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateGiftCard(
  id: number,
  data: GiftCardMutationPayload
): Promise<GiftCard> {
  const res = await apiClient<{ data: GiftCard }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteGiftCard(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteGiftCards(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function rechargeGiftCard(id: number, amount: number): Promise<GiftCard> {
  const res = await apiClient<{ data: GiftCard }>(`${BASE}/${id}/recharge`, {
    method: 'POST',
    data: { amount }
  });
  return res.data;
}
