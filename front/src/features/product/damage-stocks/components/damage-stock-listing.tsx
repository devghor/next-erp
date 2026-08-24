'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { DamageStocksTableSkeleton } from './damage-stocks-table';

const DamageStocksTable = dynamic(
  () => import('./damage-stocks-table').then((mod) => mod.DamageStocksTable),
  {
    ssr: false,
    loading: () => <DamageStocksTableSkeleton />
  }
);

export default function DamageStockListingPage() {
  return (
    <Can permission='LIST_PRODUCT_DAMAGE_STOCKS'>
      <DamageStocksTable />
    </Can>
  );
}
