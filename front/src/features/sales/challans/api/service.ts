import { apiClient } from '@/lib/api-client';
import type {
  AvailablePackingSlip,
  Challan,
  ChallanFilters,
  ChallansResponse,
  CreateChallanPayload,
  FinalizeChallanPayload
} from './types';

const BASE = '/sale/challans';

export async function getChallans(filters: ChallanFilters): Promise<ChallansResponse> {
  return apiClient<ChallansResponse>(BASE, { params: filters });
}

export async function getChallan(id: number): Promise<Challan> {
  const res = await apiClient<{ data: Challan }>(`${BASE}/${id}`);
  return res.data;
}

export async function createChallan(data: CreateChallanPayload): Promise<Challan> {
  const res = await apiClient<{ data: Challan }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function finalizeChallan(id: number, data: FinalizeChallanPayload): Promise<Challan> {
  const res = await apiClient<{ data: Challan }>(`${BASE}/${id}/finalize`, { method: 'POST', data });
  return res.data;
}

export async function getAvailablePackingSlips(): Promise<AvailablePackingSlip[]> {
  const res = await apiClient<{ data: AvailablePackingSlip[] }>(`${BASE}/available-packing-slips`);
  return res.data;
}
