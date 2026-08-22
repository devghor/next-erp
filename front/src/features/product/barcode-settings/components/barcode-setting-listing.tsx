'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { BarcodeSettingsTableSkeleton } from './barcode-settings-table';

const BarcodeSettingsTable = dynamic(
  () => import('./barcode-settings-table').then((mod) => mod.BarcodeSettingsTable),
  {
    ssr: false,
    loading: () => <BarcodeSettingsTableSkeleton />
  }
);

export default function BarcodeSettingListingPage() {
  return (
    <Can permission='LIST_PRODUCT_BARCODE_SETTINGS'>
      <BarcodeSettingsTable />
    </Can>
  );
}
