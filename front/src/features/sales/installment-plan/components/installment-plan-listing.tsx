'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { InstallmentPlansTableSkeleton } from './installment-plans-table';

const InstallmentPlansTable = dynamic(
  () => import('./installment-plans-table').then((mod) => mod.InstallmentPlansTable),
  { ssr: false, loading: () => <InstallmentPlansTableSkeleton /> }
);

export default function InstallmentPlanListingPage() {
  return (
    <Can permission='LIST_SALE_INSTALLMENT_PLANS'>
      <InstallmentPlansTable />
    </Can>
  );
}
