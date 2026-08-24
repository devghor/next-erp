import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import StockCountListingPage from '@/features/product/stock-counts/components/stock-count-listing';
import { StockCountCreateDialogTrigger } from '@/features/product/stock-counts/components/stock-count-create-dialog';

export const metadata = {
  title: 'Dashboard: Stock Counts'
};

export default function StockCountsPage() {
  return (
    <PageContainer
      pageTitle='Stock Counts'
      pageDescription='Count stock on hand and reconcile it against expected quantities'
      pageHeaderAction={
        <Can permission='CREATE_PRODUCT_STOCK_COUNTS'>
          <StockCountCreateDialogTrigger />
        </Can>
      }
    >
      <StockCountListingPage />
    </PageContainer>
  );
}
