import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import GiftCardListingPage from '@/features/sales/gift-cards/components/gift-card-listing';
import { GiftCardFormSheetTrigger } from '@/features/sales/gift-cards/components/gift-card-form-sheet';

export const metadata = {
  title: 'Dashboard: Gift Cards'
};

export default function GiftCardsPage() {
  return (
    <PageContainer
      pageTitle='Gift Cards'
      pageDescription='Issue and manage store gift cards'
      pageHeaderAction={
        <Can permission='CREATE_SALE_GIFT_CARDS'>
          <GiftCardFormSheetTrigger />
        </Can>
      }
    >
      <GiftCardListingPage />
    </PageContainer>
  );
}
