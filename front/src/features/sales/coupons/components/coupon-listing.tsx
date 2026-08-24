'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { CouponsTableSkeleton } from './coupons-table';

const CouponsTable = dynamic(() => import('./coupons-table').then((mod) => mod.CouponsTable), {
  ssr: false,
  loading: () => <CouponsTableSkeleton />
});

export default function CouponListingPage() {
  return (
    <Can permission='LIST_SALE_COUPONS'>
      <CouponsTable />
    </Can>
  );
}
