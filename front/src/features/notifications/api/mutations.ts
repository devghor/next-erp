import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  markNotificationRead,
  markAllNotificationsRead,
  runNotificationAction,
  deleteNotification
} from './service';
import { notificationKeys } from './queries';

export const markReadMutation = mutationOptions({
  mutationFn: (id: number) => markNotificationRead(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: notificationKeys.all });
  }
});

export const markAllReadMutation = mutationOptions({
  mutationFn: () => markAllNotificationsRead(),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: notificationKeys.all });
  }
});

export const runActionMutation = mutationOptions({
  mutationFn: ({ id, actionId }: { id: number; actionId: string }) => runNotificationAction(id, actionId),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: notificationKeys.all });
  }
});

export const deleteNotificationMutation = mutationOptions({
  mutationFn: (id: number) => deleteNotification(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: notificationKeys.all });
  }
});
