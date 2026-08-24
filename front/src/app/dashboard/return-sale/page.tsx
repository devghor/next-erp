import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import ReturnListingPage from '@/features/sales/return-sales/components/return-listing';

export const metadata = {
  title: 'Dashboard: Sale Returns'
};

export default function ReturnSalePage() {
  return (
    <PageContainer
      pageTitle='Sale Returns'
      pageDescription='Track and manage returned sales'
      pageHeaderAction={
        <Can permission='CREATE_SALE_SALE_RETURNS'>
          <Button render={<Link href='/dashboard/return-sale/create' aria-label='New Return' />}>
            <Icons.add className='mr-2 h-4 w-4' /> New Return
          </Button>
        </Can>
      }
    >
      <ReturnListingPage />
    </PageContainer>
  );
}
