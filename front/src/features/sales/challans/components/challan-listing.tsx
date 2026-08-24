'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { ChallansTableSkeleton } from './challans-table';

const ChallansTable = dynamic(() => import('./challans-table').then((mod) => mod.ChallansTable), {
  ssr: false,
  loading: () => <ChallansTableSkeleton />
});

export default function ChallanListingPage() {
  return (
    <Can permission='LIST_SALE_CHALLANS'>
      <ChallansTable />
    </Can>
  );
}
