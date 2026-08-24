import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import DeliveryListingPage from '@/features/sales/delivery/components/delivery-listing';
import { DeliveryFormSheetTrigger } from '@/features/sales/delivery/components/delivery-form-sheet';

export const metadata = {
  title: 'Dashboard: Delivery'
};

export default function DeliveryPage() {
  return (
    <PageContainer
      pageTitle='Delivery'
      pageDescription='Assign sales to couriers and track delivery status'
      pageHeaderAction={
        <Can permission='CREATE_SALE_DELIVERIES'>
          <DeliveryFormSheetTrigger />
        </Can>
      }
    >
      <DeliveryListingPage />
    </PageContainer>
  );
}
