import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import BarcodeSettingListingPage from '@/features/product/barcode-settings/components/barcode-setting-listing';
import { BarcodeSettingFormSheetTrigger } from '@/features/product/barcode-settings/components/barcode-setting-form-sheet';

export const metadata = {
  title: 'Dashboard: Barcode Settings'
};

export default function BarcodeSettingsPage() {
  return (
    <PageContainer
      pageTitle='Barcode Settings'
      pageDescription='Label paper templates used when printing barcodes'
      pageHeaderAction={
        <Can permission='CREATE_PRODUCT_BARCODE_SETTINGS'>
          <BarcodeSettingFormSheetTrigger />
        </Can>
      }
    >
      <BarcodeSettingListingPage />
    </PageContainer>
  );
}
