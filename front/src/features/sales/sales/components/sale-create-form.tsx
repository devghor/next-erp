'use client';

import { useRouter } from 'next/navigation';
import { SaleForm } from './sale-form';

export function SaleCreateForm() {
  const router = useRouter();

  return (
    <SaleForm
      onSuccess={(sale) => router.push(`/dashboard/sales/${sale.id}/edit`)}
      onCancel={() => router.push('/dashboard/sales')}
    />
  );
}
