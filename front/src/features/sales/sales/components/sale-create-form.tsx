'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsInteger } from 'nuqs';
import { quotationQueryOptions } from '@/features/quotation/quotations/api/queries';
import { SaleForm } from './sale-form';

export function SaleCreateForm() {
  const router = useRouter();
  const [fromQuotationId] = useQueryState('from_quotation', parseAsInteger);

  const { data: prefillQuotation, isFetched } = useQuery({
    ...quotationQueryOptions(fromQuotationId ?? 0),
    enabled: !!fromQuotationId
  });

  // Wait for the source quotation to load before mounting the form, so
  // useAppForm's defaultValues are seeded correctly on first render.
  if (fromQuotationId && !isFetched) {
    return null;
  }

  return (
    <SaleForm
      initialFromQuotation={fromQuotationId ? prefillQuotation : undefined}
      onSuccess={(sale) => router.push(`/dashboard/sales/${sale.id}/edit`)}
      onCancel={() => router.push('/dashboard/sales')}
    />
  );
}
