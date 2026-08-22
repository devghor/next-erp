'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { UsersTableSkeleton } from './users-table';

const UsersTable = dynamic(() => import('./users-table').then((mod) => mod.UsersTable), {
  ssr: false,
  loading: () => <UsersTableSkeleton />
});

export default function UserListingPage() {
  return (
    <Can permission='LIST_SETTINGS_USERS'>
      <UsersTable />
    </Can>
  );
}
