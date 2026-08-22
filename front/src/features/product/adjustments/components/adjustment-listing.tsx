'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { AdjustmentsTableSkeleton } from './adjustments-table';

const AdjustmentsTable = dynamic(
  () => import('./adjustments-table').then((mod) => mod.AdjustmentsTable),
  {
    ssr: false,
    loading: () => <AdjustmentsTableSkeleton />
  }
);

export default function AdjustmentListingPage() {
  return (
    <Can permission='LIST_PRODUCT_ADJUSTMENTS'>
      <AdjustmentsTable />
    </Can>
  );
}
