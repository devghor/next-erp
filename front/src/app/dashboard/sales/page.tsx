import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import SaleListingPage from '@/features/sales/sales/components/sale-listing';
import { SaleExportButtons } from '@/features/sales/sales/components/sale-export-buttons';

export const metadata = {
  title: 'Dashboard: Sales'
};

export default function SalesPage() {
  return (
    <PageContainer
      pageTitle='Sales'
      pageDescription='Track and manage customer sales'
      pageHeaderAction={
        <>
          <Can permission='LIST_SALE_SALES'>
            <SaleExportButtons />
          </Can>
          <Can permission='CREATE_SALE_SALES'>
            <Button
              variant='outline'
              render={<Link href='/dashboard/sales/sale_by_csv' aria-label='Import CSV' />}
            >
              <Icons.upload className='mr-2 h-4 w-4' /> Import CSV
            </Button>
            <Button render={<Link href='/dashboard/sales/create' aria-label='New Sale' />}>
              <Icons.add className='mr-2 h-4 w-4' /> New Sale
            </Button>
          </Can>
        </>
      }
    >
      <SaleListingPage />
    </PageContainer>
  );
}
