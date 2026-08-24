import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import SupplierListingPage from '@/features/people/suppliers/components/supplier-listing';
import { SupplierFormSheetTrigger } from '@/features/people/suppliers/components/supplier-form-sheet';
import { SupplierImportDialogTrigger } from '@/features/people/suppliers/components/supplier-import-dialog';
import { SupplierExportButtons } from '@/features/people/suppliers/components/supplier-export-buttons';

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
          <Can permission='LIST_PEOPLE_SUPPLIERS'>
            <SupplierExportButtons />
          </Can>
          <Can permission='CREATE_PEOPLE_SUPPLIERS'>
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
