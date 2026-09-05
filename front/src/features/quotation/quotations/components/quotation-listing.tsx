'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { QuotationsTableSkeleton } from './quotations-table';

const QuotationsTable = dynamic(
  () => import('./quotations-table').then((mod) => mod.QuotationsTable),
  {
    ssr: false,
    loading: () => <QuotationsTableSkeleton />
  }
);

export default function QuotationListingPage() {
  return (
    <Can permission='LIST_QUOTATION_QUOTATIONS'>
      <QuotationsTable />
    </Can>
  );
}
