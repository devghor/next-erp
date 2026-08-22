'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { RolesTableSkeleton } from './roles-table';

const RolesTable = dynamic(() => import('./roles-table').then((mod) => mod.RolesTable), {
  ssr: false,
  loading: () => <RolesTableSkeleton />
});

export default function RoleListingPage() {
  return (
    <Can permission='LIST_SETTINGS_ROLES'>
      <RolesTable />
    </Can>
  );
}
