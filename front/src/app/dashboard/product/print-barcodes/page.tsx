import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { PrintBarcodesView } from '@/features/product/print-barcodes/components/print-barcodes-view';

export const metadata = {
  title: 'Dashboard: Print Barcodes'
};

export default function PrintBarcodesPage() {
  return (
    <PageContainer
      pageTitle='Print Barcodes'
      pageDescription='Search products, set quantities, and print barcode labels'
    >
      <Can permission='READ_PRODUCT_PRODUCTS'>
        <PrintBarcodesView />
      </Can>
    </PageContainer>
  );
}
