'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface PosOrderTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number;
  onApply: (rate: number) => void;
}

export function PosOrderTaxDialog({ open, onOpenChange, value, onApply }: PosOrderTaxDialogProps) {
  const [rate, setRate] = useState(value);

  useEffect(() => {
    if (open) setRate(value);
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Order Tax</DialogTitle>
          <DialogDescription>A percentage rate applied to the order after discounts.</DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Tax rate (%)</FieldLabel>
          <Input type='number' min={0} step='0.01' value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} autoFocus />
        </Field>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onApply(0);
              onOpenChange(false);
            }}
          >
            Clear
          </Button>
          <Button
            type='button'
            onClick={() => {
              onApply(rate);
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
