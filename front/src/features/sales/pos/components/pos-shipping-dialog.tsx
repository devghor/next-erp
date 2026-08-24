'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface PosShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number;
  onApply: (cost: number) => void;
}

export function PosShippingDialog({ open, onOpenChange, value, onApply }: PosShippingDialogProps) {
  const [cost, setCost] = useState(value);

  useEffect(() => {
    if (open) setCost(value);
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Shipping Cost</DialogTitle>
          <DialogDescription>A flat amount added to the grand total.</DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Shipping cost</FieldLabel>
          <Input type='number' min={0} step='0.01' value={cost} onChange={(e) => setCost(Number(e.target.value) || 0)} autoFocus />
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
              onApply(cost);
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
