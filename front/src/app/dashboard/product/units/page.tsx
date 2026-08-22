import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import UnitListingPage from '@/features/product/units/components/unit-listing';
import { UnitFormSheetTrigger } from '@/features/product/units/components/unit-form-sheet';
import { UnitImportDialogTrigger } from '@/features/product/units/components/unit-import-dialog';
import { UnitExportButtons } from '@/features/product/units/components/unit-export-buttons';

export const metadata = {
  title: 'Dashboard: Units'
};

export default function UnitsPage() {
  return (
    <PageContainer
      pageTitle='Units'
      pageDescription='Product unit management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PRODUCT_UNITS'>
            <UnitExportButtons />
          </Can>
          <Can permission='CREATE_PRODUCT_UNITS'>
            <UnitImportDialogTrigger />
            <UnitFormSheetTrigger />
          </Can>
        </>
      }
    >
      <UnitListingPage />
    </PageContainer>
  );
}
