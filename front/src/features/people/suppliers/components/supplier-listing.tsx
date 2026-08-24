'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { SuppliersTableSkeleton } from './suppliers-table';

const SuppliersTable = dynamic(
  () => import('./suppliers-table').then((mod) => mod.SuppliersTable),
  {
    ssr: false,
    loading: () => <SuppliersTableSkeleton />
  }
);

export default function SupplierListingPage() {
  return (
    <Can permission='LIST_PEOPLE_SUPPLIERS'>
      <SuppliersTable />
    </Can>
  );
}
