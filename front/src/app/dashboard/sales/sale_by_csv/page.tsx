import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { SaleCsvImportForm } from '@/features/sales/sales/components/sale-csv-import-form';

export const metadata = {
  title: 'Dashboard: Import Sale by CSV'
};

export default function SaleByCsvPage() {
  return (
    <PageContainer pageTitle='Sale by CSV' pageDescription='Bulk-create a sale from a CSV file'>
      <Can permission='CREATE_SALE_SALES'>
        <SaleCsvImportForm />
      </Can>
    </PageContainer>
  );
}
