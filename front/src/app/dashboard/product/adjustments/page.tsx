import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import AdjustmentListingPage from '@/features/product/adjustments/components/adjustment-listing';
import { AdjustmentFormDialogTrigger } from '@/features/product/adjustments/components/adjustment-form-dialog';

export const metadata = {
  title: 'Dashboard: Adjustments'
};

export default function AdjustmentsPage() {
  return (
    <PageContainer
      pageTitle='Adjustments'
      pageDescription='Correct stock levels by adding or removing quantity'
      pageHeaderAction={
        <Can permission='CREATE_PRODUCT_ADJUSTMENTS'>
          <AdjustmentFormDialogTrigger />
        </Can>
      }
    >
      <AdjustmentListingPage />
    </PageContainer>
  );
}
