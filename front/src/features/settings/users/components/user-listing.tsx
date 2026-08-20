'use client';

import dynamic from 'next/dynamic';
import { UsersTableSkeleton } from './users-table';

const UsersTable = dynamic(() => import('./users-table').then((mod) => mod.UsersTable), {
  ssr: false,
  loading: () => <UsersTableSkeleton />
});

export default function UserListingPage() {
  return <UsersTable />;
}
