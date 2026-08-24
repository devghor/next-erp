'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type PosInstallmentInput = {
  name: string;
  price: number;
  additional_amount: number;
  down_payment: number;
  months: number;
};

export interface PosInstallmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grandTotal: number;
  onConfirm: (installment: PosInstallmentInput) => void;
}

/** Fields mirror the installment block in sale-form.tsx, adapted to a checkout-modal step instead of an admin form section. */
export function PosInstallmentDialog({ open, onOpenChange, grandTotal, onConfirm }: PosInstallmentDialogProps) {
  const [name, setName] = useState('Installment Plan');
  const [price, setPrice] = useState(grandTotal);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [months, setMonths] = useState(1);

  useEffect(() => {
    if (open) {
      setPrice(grandTotal);
      setAdditionalAmount(0);
      setDownPayment(0);
      setMonths(1);
    }
  }, [open, grandTotal]);

  const totalPayable = price + additionalAmount;
  const perMonth = months > 0 ? Math.max(0, (totalPayable - downPayment) / months) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Installment Plan</DialogTitle>
          <DialogDescription>Splits this sale into a down payment plus fixed monthly installments.</DialogDescription>
        </DialogHeader>

        <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field className='sm:col-span-2'>
            <FieldLabel>Plan Name</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field>
            <FieldLabel>Price</FieldLabel>
            <Input type='number' min={0} step='0.01' value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} />
          </Field>
          <Field>
            <FieldLabel>Additional Amount</FieldLabel>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(Number(e.target.value) || 0)}
            />
          </Field>
          <Field>
            <FieldLabel>Down Payment</FieldLabel>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            />
          </Field>
          <Field>
            <FieldLabel>Months</FieldLabel>
            <Input type='number' min={1} step='1' value={months} onChange={(e) => setMonths(Number(e.target.value) || 1)} />
          </Field>
        </FieldGroup>

        <p className='text-muted-foreground text-sm'>
          ~{perMonth.toFixed(2)} / month for {months} month{months === 1 ? '' : 's'}
        </p>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type='button'
            disabled={!name || price <= 0 || months < 1}
            onClick={() => {
              onConfirm({ name, price, additional_amount: additionalAmount, down_payment: downPayment, months });
              onOpenChange(false);
            }}
          >
            Confirm Installment Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
