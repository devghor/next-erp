'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { CustomFieldsTableSkeleton } from './custom-fields-table';

const CustomFieldsTable = dynamic(
  () => import('./custom-fields-table').then((mod) => mod.CustomFieldsTable),
  {
    ssr: false,
    loading: () => <CustomFieldsTableSkeleton />
  }
);

export default function CustomFieldListingPage() {
  return (
    <Can permission='LIST_SETTINGS_CUSTOM_FIELDS'>
      <CustomFieldsTable />
    </Can>
  );
}
