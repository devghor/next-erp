'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { TaxesTableSkeleton } from './taxes-table';

const TaxesTable = dynamic(() => import('./taxes-table').then((mod) => mod.TaxesTable), {
  ssr: false,
  loading: () => <TaxesTableSkeleton />
});

export default function TaxListingPage() {
  return (
    <Can permission='LIST_SETTINGS_TAXES'>
      <TaxesTable />
    </Can>
  );
}
