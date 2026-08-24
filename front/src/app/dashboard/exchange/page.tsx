import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import ExchangeListingPage from '@/features/sales/exchanges/components/exchange-listing';

export const metadata = {
  title: 'Dashboard: Exchanges'
};

export default function ExchangePage() {
  return (
    <PageContainer
      pageTitle='Exchanges'
      pageDescription='Track and manage product exchanges'
      pageHeaderAction={
        <Can permission='CREATE_SALE_EXCHANGES'>
          <Button render={<Link href='/dashboard/exchange/create' aria-label='New Exchange' />}>
            <Icons.add className='mr-2 h-4 w-4' /> New Exchange
          </Button>
        </Can>
      }
    >
      <ExchangeListingPage />
    </PageContainer>
  );
}
