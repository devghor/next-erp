import { apiClient } from '@/lib/api-client';
import type {
  Coupon,
  CouponFilters,
  CouponsResponse,
  CouponMutationPayload,
  ImportResult
} from './types';

const BASE = '/sale/coupons';

function toParams(filters: CouponFilters) {
  return {
    id: filters.id,
    code: filters.code,
    type: filters.type,
    is_active: filters.is_active,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getCoupons(filters: CouponFilters): Promise<CouponsResponse> {
  return apiClient<CouponsResponse>(BASE, { params: toParams(filters) });
}

export async function createCoupon(data: CouponMutationPayload): Promise<Coupon> {
  const res = await apiClient<{ data: Coupon }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateCoupon(id: number, data: CouponMutationPayload): Promise<Coupon> {
  const res = await apiClient<{ data: Coupon }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteCoupon(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteCoupons(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function generateCouponCode(): Promise<string> {
  const res = await apiClient<{ code: string }>(`${BASE}/generate-code`);
  return res.code;
}

export async function exportCouponsPdf(filters: CouponFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportCouponsExcel(filters: CouponFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importCoupons(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<ImportResult>(`${BASE}/import`, {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': null }
  });
}
