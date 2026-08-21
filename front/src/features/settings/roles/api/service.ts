// ============================================================
// Role Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  Role,
  RoleFilters,
  RolesResponse,
  RoleMutationPayload,
  PermissionGroupsResponse,
  ImportResult
} from './types';

const BASE = '/settings/roles';

function toParams(filters: RoleFilters) {
  return {
    id: filters.id,
    name: filters.name,
    date_from: filters.date_from,
    date_to: filters.date_to,
    page: filters.page,
    per_page: filters.per_page
  };
}

export async function getRoles(filters: RoleFilters): Promise<RolesResponse> {
  return apiClient<RolesResponse>(BASE, { params: toParams(filters) });
}

export async function getPermissionGroups(): Promise<PermissionGroupsResponse> {
  return apiClient<PermissionGroupsResponse>('/settings/permissions');
}

export async function createRole(data: RoleMutationPayload): Promise<Role> {
  const res = await apiClient<{ data: Role }>(BASE, { method: 'POST', data });
  return res.data;
}

export async function updateRole(id: number, data: RoleMutationPayload): Promise<Role> {
  const res = await apiClient<{ data: Role }>(`${BASE}/${id}`, { method: 'PUT', data });
  return res.data;
}

export async function deleteRole(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteRoles(ids: number[]): Promise<{ deleted: number }> {
  return apiClient<{ deleted: number }>(`${BASE}/bulk-delete`, { method: 'POST', data: { ids } });
}

export async function exportRolesPdf(filters: RoleFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/pdf`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function exportRolesExcel(filters: RoleFilters): Promise<Blob> {
  return apiClient<Blob>(`${BASE}/export/excel`, {
    params: toParams(filters),
    responseType: 'blob'
  });
}

export async function importRoles(file: File): Promise<ImportResult> {
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
