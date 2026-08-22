import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import WarehouseListingPage from '@/features/settings/warehouses/components/warehouse-listing';
import { WarehouseFormSheetTrigger } from '@/features/settings/warehouses/components/warehouse-form-sheet';
import { WarehouseImportDialogTrigger } from '@/features/settings/warehouses/components/warehouse-import-dialog';
import { WarehouseExportButtons } from '@/features/settings/warehouses/components/warehouse-export-buttons';

export const metadata = {
  title: 'Dashboard: Warehouses'
};

export default function WarehousesPage() {
  return (
    <PageContainer
      pageTitle='Warehouses'
      pageDescription='Warehouse management'
      pageHeaderAction={
        <>
          <Can permission='LIST_SETTINGS_WAREHOUSES'>
            <WarehouseExportButtons />
          </Can>
          <Can permission='CREATE_SETTINGS_WAREHOUSES'>
            <WarehouseImportDialogTrigger />
            <WarehouseFormSheetTrigger />
          </Can>
        </>
      }
    >
      <WarehouseListingPage />
    </PageContainer>
  );
}
