import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import ProductListingPage from '@/features/product/products/components/product-listing';
import { ProductImportDialogTrigger } from '@/features/product/products/components/product-import-dialog';
import { ProductExportButtons } from '@/features/product/products/components/product-export-buttons';

export const metadata = {
  title: 'Dashboard: Products'
};

export default function ProductsPage() {
  return (
    <PageContainer
      pageTitle='Products'
      pageDescription='Product catalog management'
      pageHeaderAction={
        <>
          <Can permission='LIST_PRODUCT_PRODUCTS'>
            <ProductExportButtons />
          </Can>
          <Can permission='CREATE_PRODUCT_PRODUCTS'>
            <ProductImportDialogTrigger />
            <Button render={<Link href='/dashboard/product/products/create' aria-label='Add New' />}>
              <Icons.add className='mr-2 h-4 w-4' /> Add New
            </Button>
          </Can>
        </>
      }
    >
      <ProductListingPage />
    </PageContainer>
  );
}
