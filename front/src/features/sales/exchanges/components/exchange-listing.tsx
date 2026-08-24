'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { ExchangesTableSkeleton } from './exchanges-table';

const ExchangesTable = dynamic(() => import('./exchanges-table').then((mod) => mod.ExchangesTable), {
  ssr: false,
  loading: () => <ExchangesTableSkeleton />
});

export default function ExchangeListingPage() {
  return (
    <Can permission='LIST_SALE_EXCHANGES'>
      <ExchangesTable />
    </Can>
  );
}
