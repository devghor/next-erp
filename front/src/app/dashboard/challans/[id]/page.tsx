import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { ChallanDetail } from '@/features/sales/challans/components/challan-detail';

export const metadata = {
  title: 'Dashboard: Challan Details'
};

export default async function ChallanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageContainer pageTitle='Challan' pageDescription='Reconcile COD collections and delivery status'>
      <Can permission='READ_SALE_CHALLANS'>
        <ChallanDetail challanId={Number(id)} />
      </Can>
    </PageContainer>
  );
}
