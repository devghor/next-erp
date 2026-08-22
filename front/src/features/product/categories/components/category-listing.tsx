'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { CategoriesTableSkeleton } from './categories-table';

const CategoriesTable = dynamic(
  () => import('./categories-table').then((mod) => mod.CategoriesTable),
  {
    ssr: false,
    loading: () => <CategoriesTableSkeleton />
  }
);

export default function CategoryListingPage() {
  return (
    <Can permission='LIST_PRODUCT_CATEGORIES'>
      <CategoriesTable />
    </Can>
  );
}
