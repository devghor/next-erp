import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import PackingSlipListingPage from '@/features/sales/packing-slips/components/packing-slip-listing';
import { PackingSlipCreateDialog } from '@/features/sales/packing-slips/components/packing-slip-create-dialog';

export const metadata = {
  title: 'Dashboard: Packing Slips'
};

export default function PackingSlipsPage() {
  return (
    <PageContainer
      pageTitle='Packing Slips'
      pageDescription='Pick and pack sale items ahead of courier handoff'
      pageHeaderAction={
        <Can permission='CREATE_SALE_PACKING_SLIPS'>
          <PackingSlipCreateDialog />
        </Can>
      }
    >
      <PackingSlipListingPage />
    </PageContainer>
  );
}
