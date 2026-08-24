import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import ChallanListingPage from '@/features/sales/challans/components/challan-listing';
import { ChallanCreateDialog } from '@/features/sales/challans/components/challan-create-dialog';

export const metadata = {
  title: 'Dashboard: Challans'
};

export default function ChallansPage() {
  return (
    <PageContainer
      pageTitle='Challans'
      pageDescription='Hand off packing slips to couriers and reconcile COD collections'
      pageHeaderAction={
        <Can permission='CREATE_SALE_CHALLANS'>
          <ChallanCreateDialog />
        </Can>
      }
    >
      <ChallanListingPage />
    </PageContainer>
  );
}
