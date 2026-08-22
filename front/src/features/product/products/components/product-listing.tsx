'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { ProductsTableSkeleton } from './products-table';

const ProductsTable = dynamic(
  () => import('./products-table').then((mod) => mod.ProductsTable),
  {
    ssr: false,
    loading: () => <ProductsTableSkeleton />
  }
);

export default function ProductListingPage() {
  return (
    <Can permission='LIST_PRODUCT_PRODUCTS'>
      <ProductsTable />
    </Can>
  );
}
