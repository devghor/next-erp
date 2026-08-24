'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { DeliveriesTableSkeleton } from './deliveries-table';

const DeliveriesTable = dynamic(
  () => import('./deliveries-table').then((mod) => mod.DeliveriesTable),
  {
    ssr: false,
    loading: () => <DeliveriesTableSkeleton />
  }
);

export default function DeliveryListingPage() {
  return (
    <Can permission='LIST_SALE_DELIVERIES'>
      <DeliveriesTable />
    </Can>
  );
}
