import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import CurrencyListingPage from '@/features/settings/currencies/components/currency-listing';
import { CurrencyFormSheetTrigger } from '@/features/settings/currencies/components/currency-form-sheet';
import { CurrencyImportDialogTrigger } from '@/features/settings/currencies/components/currency-import-dialog';
import { CurrencyExportButtons } from '@/features/settings/currencies/components/currency-export-buttons';

export const metadata = {
  title: 'Dashboard: Currencies'
};

export default function CurrenciesPage() {
  return (
    <PageContainer
      pageTitle='Currencies'
      pageDescription='Currency management'
      pageHeaderAction={
        <>
          <Can permission='LIST_SETTINGS_CURRENCIES'>
            <CurrencyExportButtons />
          </Can>
          <Can permission='CREATE_SETTINGS_CURRENCIES'>
            <CurrencyImportDialogTrigger />
            <CurrencyFormSheetTrigger />
          </Can>
        </>
      }
    >
      <CurrencyListingPage />
    </PageContainer>
  );
}
