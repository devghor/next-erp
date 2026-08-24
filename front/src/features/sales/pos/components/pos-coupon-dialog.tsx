'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { couponsQueryOptions } from '@/features/sales/coupons/api/queries';
import type { PosCoupon } from '../hooks/use-pos-cart';

export interface PosCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartTotal: number;
  onApply: (coupon: PosCoupon) => void;
}

/** Coupons have no dedicated "apply" endpoint yet — looked up by code from the existing coupon list and validated client-side (active, not expired, quantity left, minimum order amount). */
export function PosCouponDialog({ open, onOpenChange, cartTotal, onApply }: PosCouponDialogProps) {
  const [code, setCode] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    ...couponsQueryOptions({ code: lookupCode, per_page: 1 }),
    enabled: lookupCode.length > 0
  });

  function handleSearch() {
    setError(null);
    setLookupCode(code.trim());
  }

  function handleApply() {
    const coupon = data?.data?.[0];
    if (!coupon) {
      setError('Coupon not found');
      return;
    }
    if (!coupon.is_active) {
      setError('This coupon is not active');
      return;
    }
    if (coupon.expired_date && new Date(coupon.expired_date) < new Date()) {
      setError('This coupon has expired');
      return;
    }
    if (coupon.quantity > 0 && coupon.used >= coupon.quantity) {
      setError('This coupon has been fully redeemed');
      return;
    }
    if (coupon.type === 'fixed' && coupon.minimum_amount > cartTotal) {
      setError(`Cart must be at least ${coupon.minimum_amount} to use this coupon`);
      return;
    }

    onApply({ id: coupon.id, code: coupon.code, type: coupon.type, amount: coupon.amount });
    setCode('');
    setLookupCode('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Apply Coupon</DialogTitle>
          <DialogDescription>Enter a coupon code to discount this order.</DialogDescription>
        </DialogHeader>

        <Field data-invalid={!!error}>
          <FieldLabel>Coupon code</FieldLabel>
          <div className='flex gap-2'>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder='SAVE10'
              autoFocus
              className='flex-1'
            />
            <Button type='button' variant='outline' onClick={handleSearch} disabled={!code.trim() || isFetching}>
              {isFetching ? 'Checking…' : 'Check'}
            </Button>
          </div>
          {error && <FieldError errors={[{ message: error }]} />}
          {!error && data?.data?.[0] && (
            <p className='text-sm text-emerald-600'>
              {data.data[0].code}: {data.data[0].type === 'percentage' ? `${data.data[0].amount}%` : data.data[0].amount} off
            </p>
          )}
        </Field>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={handleApply} disabled={!data?.data?.[0]}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
