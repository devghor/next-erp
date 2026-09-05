'use client';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { NotificationCard } from '@/components/ui/notification-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsInteger, parseAsStringEnum } from 'nuqs';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { notificationsQueryOptions, unreadCountQueryOptions } from '../api/queries';
import { markReadMutation, markAllReadMutation, runActionMutation } from '../api/mutations';

type TabValue = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useQueryState('tab', parseAsStringEnum<TabValue>(['all', 'unread', 'read']).withDefault('all'));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const { data, isFetching } = useQuery({
    ...notificationsQueryOptions({ status: tab, page }),
    placeholderData: keepPreviousData
  });
  const { data: unreadCount = 0 } = useQuery(unreadCountQueryOptions());
  const markRead = useMutation(markReadMutation);
  const markAllRead = useMutation(markAllReadMutation);
  const runAction = useMutation(runActionMutation);

  const notifications = data?.data ?? [];
  const currentPage = data?.meta.current_page ?? 1;
  const lastPage = data?.meta.last_page ?? 1;

  const handleTabChange = (value: string) => {
    void setTab(value as TabValue);
    void setPage(1);
  };

  return (
    <PageContainer
      pageTitle='Notifications'
      pageDescription='View and manage all your notifications.'
      pageHeaderAction={
        unreadCount > 0 ? (
          <Button variant='outline' size='sm' onClick={() => markAllRead.mutate()}>
            Mark all as read
          </Button>
        ) : undefined
      }
    >
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='unread'>{unreadCount > 0 ? `Unread (${unreadCount})` : 'Unread'}</TabsTrigger>
          <TabsTrigger value='read'>Read</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className='mt-4'>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <Icons.notification className='text-muted-foreground/40 mb-3 h-10 w-10' />
              <p className='text-muted-foreground text-sm'>No notifications</p>
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  id={String(notification.id)}
                  title={notification.title}
                  body={notification.body}
                  status={notification.status}
                  createdAt={notification.created_at}
                  actions={notification.actions ?? undefined}
                  onMarkAsRead={(id) => markRead.mutate(Number(id))}
                  onAction={(notifId, actionId, actionType) => {
                    runAction.mutate({ id: Number(notifId), actionId });
                    if (actionType === 'redirect') {
                      const action = notification.actions?.find((a) => a.id === actionId);
                      if (action?.url) router.push(action.url);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {lastPage > 1 && (
        <div className='mt-4 flex items-center justify-end gap-2'>
          <span className='text-muted-foreground text-xs'>
            Page {currentPage} of {lastPage}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={currentPage <= 1 || isFetching}
            onClick={() => void setPage(Math.max(1, currentPage - 1))}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={currentPage >= lastPage || isFetching}
            onClick={() => void setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
