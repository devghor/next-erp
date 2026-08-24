import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import PurchaseListingPage from '@/features/purchase/purchases/components/purchase-listing';
import { PurchaseFormDialogTrigger } from '@/features/purchase/purchases/components/purchase-form-dialog';
import { PurchaseExportButtons } from '@/features/purchase/purchases/components/purchase-export-buttons';
import { PurchaseImportButton } from '@/features/purchase/purchases/components/purchase-import-button';

export const metadata = {
  title: 'Dashboard: Purchases'
};

export default function PurchasesPage() {
  return (
    <PageContainer
      pageTitle='Purchases'
      pageDescription='Receive stock and track supplier purchases'
      pageHeaderAction={
        <>
          <Can permission='LIST_PURCHASE_PURCHASES'>
            <PurchaseExportButtons />
          </Can>
          <Can permission='CREATE_PURCHASE_PURCHASES'>
            <PurchaseImportButton />
          </Can>
          <Can permission='CREATE_PURCHASE_PURCHASES'>
            <PurchaseFormDialogTrigger />
          </Can>
        </>
      }
    >
      <PurchaseListingPage />
    </PageContainer>
  );
}
