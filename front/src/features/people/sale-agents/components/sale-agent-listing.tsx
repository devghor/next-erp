'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { SaleAgentsTableSkeleton } from './sale-agents-table';

const SaleAgentsTable = dynamic(
  () => import('./sale-agents-table').then((mod) => mod.SaleAgentsTable),
  {
    ssr: false,
    loading: () => <SaleAgentsTableSkeleton />
  }
);

export default function SaleAgentListingPage() {
  return (
    <Can permission='LIST_PEOPLE_SALE_AGENTS'>
      <SaleAgentsTable />
    </Can>
  );
}
