'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { ExchangeForm } from '@/features/sales/exchanges/components/exchange-form';

export default function CreateExchangePage() {
  const router = useRouter();

  return (
    <PageContainer pageTitle='New Exchange' pageDescription='Exchange products, optionally linked to an existing sale'>
      <Can permission='CREATE_SALE_EXCHANGES'>
        <ExchangeForm
          onSuccess={(exchange) => router.push(`/dashboard/exchange?highlight=${exchange.id}`)}
          onCancel={() => router.push('/dashboard/exchange')}
        />
      </Can>
    </PageContainer>
  );
}
