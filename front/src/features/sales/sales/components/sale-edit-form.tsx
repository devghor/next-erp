'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { saleQueryOptions } from '../api/queries';
import { SaleForm } from './sale-form';

interface SaleEditFormProps {
  saleId: number;
}

export function SaleEditForm({ saleId }: SaleEditFormProps) {
  const router = useRouter();
  const { data: sale, isPending } = useQuery(saleQueryOptions(saleId));

  if (isPending || !sale) {
    return <div className='bg-muted h-96 w-full animate-pulse rounded-lg' />;
  }

  return (
    <SaleForm sale={sale} onSuccess={() => router.push('/dashboard/sales')} onCancel={() => router.push('/dashboard/sales')} />
  );
}
