import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { InstallmentPlanDetail } from '@/features/sales/installment-plan/components/installment-plan-detail';

export const metadata = {
  title: 'Dashboard: Installment Plan Details'
};

export default async function InstallmentPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageContainer pageTitle='Installment Plan' pageDescription='Plan schedule and payment history'>
      <Can permission='READ_SALE_INSTALLMENT_PLANS'>
        <InstallmentPlanDetail planId={Number(id)} />
      </Can>
    </PageContainer>
  );
}
