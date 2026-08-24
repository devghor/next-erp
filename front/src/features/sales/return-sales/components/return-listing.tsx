'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { ReturnsTableSkeleton } from './returns-table';

const ReturnsTable = dynamic(() => import('./returns-table').then((mod) => mod.ReturnsTable), {
  ssr: false,
  loading: () => <ReturnsTableSkeleton />
});

export default function ReturnListingPage() {
  return (
    <Can permission='LIST_SALE_SALE_RETURNS'>
      <ReturnsTable />
    </Can>
  );
}
