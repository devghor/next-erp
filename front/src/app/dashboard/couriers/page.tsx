import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import CourierListingPage from '@/features/sales/couriers/components/courier-listing';
import { CourierFormSheetTrigger } from '@/features/sales/couriers/components/courier-form-sheet';
import { CourierImportDialogTrigger } from '@/features/sales/couriers/components/courier-import-dialog';
import { CourierExportButtons } from '@/features/sales/couriers/components/courier-export-buttons';

export const metadata = {
  title: 'Dashboard: Couriers'
};

export default function CouriersPage() {
  return (
    <PageContainer
      pageTitle='Couriers'
      pageDescription='Courier accounts used for delivery tracking'
      pageHeaderAction={
        <>
          <Can permission='LIST_SALE_COURIERS'>
            <CourierExportButtons />
          </Can>
          <Can permission='CREATE_SALE_COURIERS'>
            <CourierImportDialogTrigger />
            <CourierFormSheetTrigger />
          </Can>
        </>
      }
    >
      <CourierListingPage />
    </PageContainer>
  );
}
