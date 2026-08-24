'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { ReturnForm } from '@/features/sales/return-sales/components/return-form';

export default function CreateReturnSalePage() {
  const router = useRouter();

  return (
    <PageContainer pageTitle='New Return' pageDescription='Return items from a completed sale'>
      <Can permission='CREATE_SALE_SALE_RETURNS'>
        <ReturnForm
          onSuccess={(saleReturn) => router.push(`/dashboard/return-sale?highlight=${saleReturn.id}`)}
          onCancel={() => router.push('/dashboard/return-sale')}
        />
      </Can>
    </PageContainer>
  );
}
