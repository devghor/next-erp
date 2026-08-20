// ============================================================
// User Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { User, UserFilters, UsersResponse, UserMutationPayload, ImportResult } from './types';

const BASE = '/setting/users';

function toParams(filters: UserFilters) {
  return {
    id: filters.id,
    name: filters.name,
    email: filters.email,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getUsers(filters: UserFilters): Promise<UsersResponse> {
  return apiClient<UsersResponse>(BASE, { params: toParams(filters) });
}

export async function createUser(data: UserMutationPayload): Promise<User> {
  const res = await apiClient<{ data: User }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateUser(id: number, data: UserMutationPayload): Promise<User> {
  const res = await apiClient<{ data: User }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportUsersPdf(filters: UserFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportUsersExcel(filters: UserFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importUsers(file: File): Promise<ImportResult> {
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
