'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { BrandsTableSkeleton } from './brands-table';

const BrandsTable = dynamic(() => import('./brands-table').then((mod) => mod.BrandsTable), {
  ssr: false,
  loading: () => <BrandsTableSkeleton />
});

export default function BrandListingPage() {
  return (
    <Can permission='LIST_PRODUCT_BRANDS'>
      <BrandsTable />
    </Can>
  );
}
