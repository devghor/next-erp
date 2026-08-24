// ============================================================
// Sale Exchange Service — Data Access Layer
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { SaleExchange, SaleExchangeFilters, SaleExchangesResponse, SaleExchangeMutationPayload } from './types';
import type { Sale } from '@/features/sales/sales/api/types';

const BASE = '/sale/sale-exchanges';

function toParams(filters: SaleExchangeFilters) {
  return {
    warehouse_id: filters.warehouse_id,
    customer_id: filters.customer_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getSaleExchanges(filters: SaleExchangeFilters): Promise<SaleExchangesResponse> {
  return apiClient<SaleExchangesResponse>(BASE, { params: toParams(filters) });
}

export async function getSaleExchange(id: number): Promise<SaleExchange> {
  const res = await apiClient<{ data: SaleExchange }>(`${BASE}/${id}`);
  return res.data;
}

export async function createSaleExchange(data: SaleExchangeMutationPayload): Promise<SaleExchange> {
  const res = await apiClient<{ data: SaleExchange }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function getSaleLinesForExchange(saleId: number): Promise<{ data: unknown[] }> {
  return apiClient<{ data: unknown[] }>(`${BASE}/sale-lines/${saleId}`);
}

export async function findSaleByReference(referenceNo: string): Promise<Sale> {
  const res = await apiClient<{ data: Sale }>(`${BASE}/search-by-reference`, { params: { reference_no: referenceNo } });
  return res.data;
}
