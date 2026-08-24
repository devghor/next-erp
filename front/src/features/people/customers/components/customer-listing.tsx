'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { CustomersTableSkeleton } from './customers-table';

const CustomersTable = dynamic(
  () => import('./customers-table').then((mod) => mod.CustomersTable),
  {
    ssr: false,
    loading: () => <CustomersTableSkeleton />
  }
);

export default function CustomerListingPage() {
  return (
    <Can permission='LIST_PEOPLE_CUSTOMERS'>
      <CustomersTable />
    </Can>
  );
}
