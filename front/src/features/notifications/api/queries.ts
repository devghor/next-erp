import { queryOptions } from '@tanstack/react-query';
import { getNotifications, getUnreadCount } from './service';
import type { NotificationFilters } from './types';

const POLL_INTERVAL = 30_000;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const
};

export const notificationsQueryOptions = (filters: NotificationFilters) =>
  queryOptions({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getNotifications(filters),
    refetchInterval: POLL_INTERVAL
  });

export const unreadCountQueryOptions = () =>
  queryOptions({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadCount(),
    refetchInterval: POLL_INTERVAL
  });
