'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PosOrderDiscount } from '../hooks/use-pos-cart';

export interface PosOrderDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PosOrderDiscount;
  onApply: (discount: PosOrderDiscount) => void;
}

export function PosOrderDiscountDialog({ open, onOpenChange, value, onApply }: PosOrderDiscountDialogProps) {
  const [type, setType] = useState(value.type);
  const [amount, setAmount] = useState(value.value);

  useEffect(() => {
    if (open) {
      setType(value.type);
      setAmount(value.value);
    }
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Order Discount</DialogTitle>
          <DialogDescription>Applies to the whole order, on top of any per-line discounts.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select value={type} onValueChange={(v) => setType(v as PosOrderDiscount['type'])}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='fixed'>Fixed amount</SelectItem>
                <SelectItem value='percentage'>Percentage</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Value</FieldLabel>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              autoFocus
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onApply({ type: 'fixed', value: 0 });
              onOpenChange(false);
            }}
          >
            Clear
          </Button>
          <Button
            type='button'
            onClick={() => {
              onApply({ type, value: amount });
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
