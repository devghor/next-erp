'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { PurchasesTableSkeleton } from './purchases-table';

const PurchasesTable = dynamic(() => import('./purchases-table').then((mod) => mod.PurchasesTable), {
  ssr: false,
  loading: () => <PurchasesTableSkeleton />
});

export default function PurchaseListingPage() {
  return (
    <Can permission='LIST_PURCHASE_PURCHASES'>
      <PurchasesTable />
    </Can>
  );
}
