import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { SaleCreateForm } from '@/features/sales/sales/components/sale-create-form';

export const metadata = {
  title: 'Dashboard: New Sale'
};

export default function CreateSalePage() {
  return (
    <PageContainer pageTitle='New Sale' pageDescription='Record a new customer sale'>
      <Can permission='CREATE_SALE_SALES'>
        <SaleCreateForm />
      </Can>
    </PageContainer>
  );
}
