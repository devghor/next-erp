import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import CustomerListingPage from '@/features/people/customers/components/customer-listing';
import { CustomerFormSheetTrigger } from '@/features/people/customers/components/customer-form-sheet';
import { CustomerImportDialogTrigger } from '@/features/people/customers/components/customer-import-dialog';
import { CustomerExportButtons } from '@/features/people/customers/components/customer-export-buttons';

export const metadata = {
  title: 'Dashboard: Customers'
};

export default function CustomersPage() {
  return (
    <PageContainer
      pageTitle='Customers'
      pageDescription='Customer management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PEOPLE_CUSTOMERS'>
            <CustomerExportButtons />
          </Can>
          <Can permission='CREATE_PEOPLE_CUSTOMERS'>
            <CustomerImportDialogTrigger />
            <CustomerFormSheetTrigger />
          </Can>
        </>
      }
    >
      <CustomerListingPage />
    </PageContainer>
  );
}
