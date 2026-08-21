'use client';

import dynamic from 'next/dynamic';
import { RolesTableSkeleton } from './roles-table';

const RolesTable = dynamic(() => import('./roles-table').then((mod) => mod.RolesTable), {
  ssr: false,
  loading: () => <RolesTableSkeleton />
});

export default function RoleListingPage() {
  return <RolesTable />;
}
