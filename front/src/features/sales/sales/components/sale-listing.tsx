'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { SalesTableSkeleton } from './sales-table';

const SalesTable = dynamic(() => import('./sales-table').then((mod) => mod.SalesTable), {
  ssr: false,
  loading: () => <SalesTableSkeleton />
});

export default function SaleListingPage() {
  return (
    <Can permission='LIST_SALE_SALES'>
      <SalesTable />
    </Can>
  );
}
