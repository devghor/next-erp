'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { WarehousesTableSkeleton } from './warehouses-table';

const WarehousesTable = dynamic(
  () => import('./warehouses-table').then((mod) => mod.WarehousesTable),
  {
    ssr: false,
    loading: () => <WarehousesTableSkeleton />
  }
);

export default function WarehouseListingPage() {
  return (
    <Can permission='LIST_SETTINGS_WAREHOUSES'>
      <WarehousesTable />
    </Can>
  );
}
