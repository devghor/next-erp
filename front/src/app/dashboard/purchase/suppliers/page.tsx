import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import SupplierListingPage from '@/features/purchase/suppliers/components/supplier-listing';
import { SupplierFormSheetTrigger } from '@/features/purchase/suppliers/components/supplier-form-sheet';
import { SupplierImportDialogTrigger } from '@/features/purchase/suppliers/components/supplier-import-dialog';
import { SupplierExportButtons } from '@/features/purchase/suppliers/components/supplier-export-buttons';

export const metadata = {
  title: 'Dashboard: Suppliers'
};

export default function SuppliersPage() {
  return (
    <PageContainer
      pageTitle='Suppliers'
      pageDescription='Supplier management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PURCHASE_SUPPLIERS'>
            <SupplierExportButtons />
          </Can>
          <Can permission='CREATE_PURCHASE_SUPPLIERS'>
            <SupplierImportDialogTrigger />
            <SupplierFormSheetTrigger />
          </Can>
        </>
      }
    >
      <SupplierListingPage />
    </PageContainer>
  );
}
