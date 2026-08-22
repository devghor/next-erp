import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import BrandListingPage from '@/features/product/brands/components/brand-listing';
import { BrandFormSheetTrigger } from '@/features/product/brands/components/brand-form-sheet';
import { BrandImportDialogTrigger } from '@/features/product/brands/components/brand-import-dialog';
import { BrandExportButtons } from '@/features/product/brands/components/brand-export-buttons';

export const metadata = {
  title: 'Dashboard: Brands'
};

export default function BrandsPage() {
  return (
    <PageContainer
      pageTitle='Brands'
      pageDescription='Product brand management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PRODUCT_BRANDS'>
            <BrandExportButtons />
          </Can>
          <Can permission='CREATE_PRODUCT_BRANDS'>
            <BrandImportDialogTrigger />
            <BrandFormSheetTrigger />
          </Can>
        </>
      }
    >
      <BrandListingPage />
    </PageContainer>
  );
}
