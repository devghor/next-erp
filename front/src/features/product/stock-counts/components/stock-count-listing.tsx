'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { StockCountsTableSkeleton } from './stock-counts-table';

const StockCountsTable = dynamic(
  () => import('./stock-counts-table').then((mod) => mod.StockCountsTable),
  {
    ssr: false,
    loading: () => <StockCountsTableSkeleton />
  }
);

export default function StockCountListingPage() {
  return (
    <Can permission='LIST_PRODUCT_STOCK_COUNTS'>
      <StockCountsTable />
    </Can>
  );
}
