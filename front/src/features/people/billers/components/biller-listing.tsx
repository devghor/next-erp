'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { BillersTableSkeleton } from './billers-table';

const BillersTable = dynamic(() => import('./billers-table').then((mod) => mod.BillersTable), {
  ssr: false,
  loading: () => <BillersTableSkeleton />
});

export default function BillerListingPage() {
  return (
    <Can permission='LIST_PEOPLE_BILLERS'>
      <BillersTable />
    </Can>
  );
}
