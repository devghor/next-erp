'use client';

import { useRouter } from 'next/navigation';
import { ImportButton } from '@/components/buttons/import-button';

export function PurchaseImportButton() {
  const router = useRouter();

  return <ImportButton onClick={() => router.push('/dashboard/purchase/purchase_by_csv')} />;
}
