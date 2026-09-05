export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationActionType = 'redirect' | 'api_call' | 'workflow' | 'modal';
export type NotificationActionStyle = 'primary' | 'danger' | 'default';

export type NotificationActionDto = {
  id: string;
  label: string;
  type: NotificationActionType;
  style?: NotificationActionStyle;
  executed: boolean;
  url?: string | null;
};

export type NotificationDto = {
  id: number;
  title: string;
  body: string;
  status: NotificationStatus;
  actions: NotificationActionDto[] | null;
  created_at: string;
};

export type NotificationFilters = {
  status?: 'all' | 'unread' | 'read';
  page?: number;
  per_page?: number;
};

export type NotificationsResponse = {
  data: NotificationDto[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
