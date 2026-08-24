import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { SaleEditForm } from '@/features/sales/sales/components/sale-edit-form';

export const metadata = {
  title: 'Dashboard: Edit Sale'
};

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageContainer pageTitle='Edit Sale' pageDescription='Update sale details'>
      <Can permission='UPDATE_SALE_SALES'>
        <SaleEditForm saleId={Number(id)} />
      </Can>
    </PageContainer>
  );
}
