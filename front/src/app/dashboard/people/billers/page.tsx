import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import BillerListingPage from '@/features/people/billers/components/biller-listing';
import { BillerFormSheetTrigger } from '@/features/people/billers/components/biller-form-sheet';
import { BillerImportDialogTrigger } from '@/features/people/billers/components/biller-import-dialog';
import { BillerExportButtons } from '@/features/people/billers/components/biller-export-buttons';

export const metadata = {
  title: 'Dashboard: Billers'
};

export default function BillersPage() {
  return (
    <PageContainer
      pageTitle='Billers'
      pageDescription='Biller management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PEOPLE_BILLERS'>
            <BillerExportButtons />
          </Can>
          <Can permission='CREATE_PEOPLE_BILLERS'>
            <BillerImportDialogTrigger />
            <BillerFormSheetTrigger />
          </Can>
        </>
      }
    >
      <BillerListingPage />
    </PageContainer>
  );
}
