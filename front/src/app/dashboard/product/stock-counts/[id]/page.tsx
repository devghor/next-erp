import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import { StockCountDetail } from '@/features/product/stock-counts/components/stock-count-detail';

export const metadata = {
  title: 'Dashboard: Stock Count Details'
};

export default async function StockCountDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageContainer
      pageTitle='Stock Count Details'
      pageDescription='Enter counted quantities and reconcile stock'
    >
      <Can permission='READ_PRODUCT_STOCK_COUNTS'>
        <StockCountDetail id={Number(id)} />
      </Can>
    </PageContainer>
  );
}
