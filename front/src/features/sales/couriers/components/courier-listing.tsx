'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { CouriersTableSkeleton } from './couriers-table';

const CouriersTable = dynamic(
  () => import('./couriers-table').then((mod) => mod.CouriersTable),
  {
    ssr: false,
    loading: () => <CouriersTableSkeleton />
  }
);

export default function CourierListingPage() {
  return (
    <Can permission='LIST_SALE_COURIERS'>
      <CouriersTable />
    </Can>
  );
}
