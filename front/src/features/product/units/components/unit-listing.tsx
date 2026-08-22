'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { UnitsTableSkeleton } from './units-table';

const UnitsTable = dynamic(() => import('./units-table').then((mod) => mod.UnitsTable), {
  ssr: false,
  loading: () => <UnitsTableSkeleton />
});

export default function UnitListingPage() {
  return (
    <Can permission='LIST_PRODUCT_UNITS'>
      <UnitsTable />
    </Can>
  );
}
