import PageContainer from '@/components/layout/page-container';
import InstallmentPlanListingPage from '@/features/sales/installment-plan/components/installment-plan-listing';

export const metadata = {
  title: 'Dashboard: Installment Plans'
};

export default function InstallmentPlanPage() {
  return (
    <PageContainer pageTitle='Installment Plans' pageDescription='Track sale installment plans and collect payments'>
      <InstallmentPlanListingPage />
    </PageContainer>
  );
}
