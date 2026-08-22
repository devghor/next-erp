'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { CurrenciesTableSkeleton } from './currencies-table';

const CurrenciesTable = dynamic(
  () => import('./currencies-table').then((mod) => mod.CurrenciesTable),
  {
    ssr: false,
    loading: () => <CurrenciesTableSkeleton />
  }
);

export default function CurrencyListingPage() {
  return (
    <Can permission='LIST_SETTINGS_CURRENCIES'>
      <CurrenciesTable />
    </Can>
  );
}
