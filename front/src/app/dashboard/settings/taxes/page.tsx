import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import TaxListingPage from '@/features/settings/taxes/components/tax-listing';
import { TaxFormSheetTrigger } from '@/features/settings/taxes/components/tax-form-sheet';
import { TaxImportDialogTrigger } from '@/features/settings/taxes/components/tax-import-dialog';
import { TaxExportButtons } from '@/features/settings/taxes/components/tax-export-buttons';

export const metadata = {
  title: 'Dashboard: Taxes'
};

export default function TaxesPage() {
  return (
    <PageContainer
      pageTitle='Taxes'
      pageDescription='Tax management'
      pageHeaderAction={
        <>
          <Can permission='LIST_SETTINGS_TAXES'>
            <TaxExportButtons />
          </Can>
          <Can permission='CREATE_SETTINGS_TAXES'>
            <TaxImportDialogTrigger />
            <TaxFormSheetTrigger />
          </Can>
        </>
      }
    >
      <TaxListingPage />
    </PageContainer>
  );
}
