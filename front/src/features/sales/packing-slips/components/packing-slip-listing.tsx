'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { PackingSlipsTableSkeleton } from './packing-slips-table';

const PackingSlipsTable = dynamic(
  () => import('./packing-slips-table').then((mod) => mod.PackingSlipsTable),
  {
    ssr: false,
    loading: () => <PackingSlipsTableSkeleton />
  }
);

export default function PackingSlipListingPage() {
  return (
    <Can permission='LIST_SALE_PACKING_SLIPS'>
      <PackingSlipsTable />
    </Can>
  );
}
