'use client';

import dynamic from 'next/dynamic';
import { Can } from '@/components/can';
import { GiftCardsTableSkeleton } from './gift-cards-table';

const GiftCardsTable = dynamic(
  () => import('./gift-cards-table').then((mod) => mod.GiftCardsTable),
  {
    ssr: false,
    loading: () => <GiftCardsTableSkeleton />
  }
);

export default function GiftCardListingPage() {
  return (
    <Can permission='LIST_SALE_GIFT_CARDS'>
      <GiftCardsTable />
    </Can>
  );
}
