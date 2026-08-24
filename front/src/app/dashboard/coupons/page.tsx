import PageContainer from '@/components/layout/page-container';
import { Can } from '@/components/can';
import CouponListingPage from '@/features/sales/coupons/components/coupon-listing';
import { CouponFormDialogTrigger } from '@/features/sales/coupons/components/coupon-form-dialog';
import { CouponImportDialogTrigger } from '@/features/sales/coupons/components/coupon-import-dialog';
import { CouponExportButtons } from '@/features/sales/coupons/components/coupon-export-buttons';

export const metadata = {
  title: 'Dashboard: Coupons'
};

export default function CouponsPage() {
  return (
    <PageContainer
      pageTitle='Coupons'
      pageDescription='Discount coupons customers can redeem at checkout'
      pageHeaderAction={
        <>
          <Can permission='LIST_SALE_COUPONS'>
            <CouponExportButtons />
          </Can>
          <Can permission='CREATE_SALE_COUPONS'>
            <CouponImportDialogTrigger />
            <CouponFormDialogTrigger />
          </Can>
        </>
      }
    >
      <CouponListingPage />
    </PageContainer>
  );
}
