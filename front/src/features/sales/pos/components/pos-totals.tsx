'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { PosCartTotals, PosCoupon, PosOrderDiscount } from '../hooks/use-pos-cart';
import { formatMoney } from '../lib/money';

export interface PosTotalsProps {
  totals: PosCartTotals;
  orderDiscount: PosOrderDiscount;
  coupon: PosCoupon | null;
  orderTaxRate: number;
  shippingCost: number;
  currencyCode?: string | null;
  onOpenDiscount: () => void;
  onOpenCoupon: () => void;
  onOpenTax: () => void;
  onOpenShipping: () => void;
  onRemoveCoupon: () => void;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className='flex items-center justify-between text-sm'>
      <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
      <span className={muted ? 'text-muted-foreground' : 'font-medium'}>{value}</span>
    </div>
  );
}

export function PosTotals({
  totals,
  orderDiscount,
  coupon,
  orderTaxRate,
  shippingCost,
  currencyCode,
  onOpenDiscount,
  onOpenCoupon,
  onOpenTax,
  onOpenShipping,
  onRemoveCoupon
}: PosTotalsProps) {
  const money = (value: number) => formatMoney(value, { currencyCode });

  return (
    <div className='space-y-3 border-t p-3'>
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={onOpenDiscount}>
          <Icons.discount className='mr-1.5 h-3.5 w-3.5' />
          Discount{orderDiscount.value > 0 ? ` (${orderDiscount.type === 'percentage' ? `${orderDiscount.value}%` : money(orderDiscount.value)})` : ''}
        </Button>
        <Button type='button' variant='outline' size='sm' onClick={onOpenCoupon}>
          <Icons.coupon className='mr-1.5 h-3.5 w-3.5' />
          {coupon ? coupon.code : 'Coupon'}
        </Button>
        {coupon && (
          <Button type='button' variant='ghost' size='sm' onClick={onRemoveCoupon} aria-label='Remove coupon'>
            <Icons.close className='h-3.5 w-3.5' />
          </Button>
        )}
        <Button type='button' variant='outline' size='sm' onClick={onOpenTax}>
          <Icons.percentage className='mr-1.5 h-3.5 w-3.5' />
          Tax{orderTaxRate > 0 ? ` (${orderTaxRate}%)` : ''}
        </Button>
        <Button type='button' variant='outline' size='sm' onClick={onOpenShipping}>
          <Icons.courier className='mr-1.5 h-3.5 w-3.5' />
          Shipping{shippingCost > 0 ? ` (${money(shippingCost)})` : ''}
        </Button>
      </div>

      <div className='space-y-1.5'>
        <Row label='Items subtotal' value={money(totals.itemsSubtotal)} muted />
        {totals.lineDiscountTotal > 0 && <Row label='Line discounts' value={`-${money(totals.lineDiscountTotal)}`} muted />}
        {totals.lineTaxTotal > 0 && <Row label='Line tax' value={money(totals.lineTaxTotal)} muted />}
        {totals.orderDiscountAmount > 0 && <Row label='Order discount' value={`-${money(totals.orderDiscountAmount)}`} muted />}
        {totals.couponDiscountAmount > 0 && (
          <Row label={`Coupon${coupon ? ` (${coupon.code})` : ''}`} value={`-${money(totals.couponDiscountAmount)}`} muted />
        )}
        {totals.orderTaxAmount > 0 && <Row label='Order tax' value={money(totals.orderTaxAmount)} muted />}
        {shippingCost > 0 && <Row label='Shipping' value={money(shippingCost)} muted />}
      </div>

      <div className='flex items-center justify-between border-t pt-2'>
        <span className='text-base font-semibold'>Grand Total</span>
        <Badge variant='default' className='px-3 py-1.5 text-lg font-bold'>
          {money(totals.grandTotal)}
        </Badge>
      </div>
    </div>
  );
}
