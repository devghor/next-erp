import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import DamageStockListingPage from '@/features/product/damage-stocks/components/damage-stock-listing';
import { DamageStockFormDialogTrigger } from '@/features/product/damage-stocks/components/damage-stock-form-dialog';

export const metadata = {
  title: 'Dashboard: Damage Stocks'
};

export default function DamageStocksPage() {
  return (
    <PageContainer
      pageTitle='Damage Stocks'
      pageDescription='Record damaged products and deduct them from stock'
      pageHeaderAction={
        <Can permission='CREATE_PRODUCT_DAMAGE_STOCKS'>
          <DamageStockFormDialogTrigger />
        </Can>
      }
    >
      <DamageStockListingPage />
    </PageContainer>
  );
}
