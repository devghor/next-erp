// ============================================================
// Notification Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { NotificationDto, NotificationFilters, NotificationsResponse } from './types';

const BASE = '/notification/notifications';

export async function getNotifications(filters: NotificationFilters): Promise<NotificationsResponse> {
  return apiClient<NotificationsResponse>(BASE, {
    params: { status: filters.status, page: filters.page, per_page: filters.per_page }
  });
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient<{ count: number }>(`${BASE}/unread-count`);
  return res.count;
}

export async function markNotificationRead(id: number): Promise<NotificationDto> {
  const res = await apiClient<{ data: NotificationDto }>(`${BASE}/${id}/read`, { method: 'PUT' });
  return res.data;
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiClient<{ updated: number }>(`${BASE}/mark-all-read`, { method: 'POST' });
}

export async function runNotificationAction(id: number, actionId: string): Promise<NotificationDto> {
  const res = await apiClient<{ data: NotificationDto }>(`${BASE}/${id}/actions/${actionId}`, { method: 'POST' });
  return res.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient<void>(`${BASE}/${id}`, { method: 'DELETE' });
}
