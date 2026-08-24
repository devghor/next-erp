'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/lib/form';
import { payInstallmentMutation } from '../api/mutations';
import type { Installment } from '../api/types';

interface PayInstallmentDialogProps {
  installment: Installment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayInstallmentDialog({ installment, open, onOpenChange }: PayInstallmentDialogProps) {
  const payMutation = useMutation({
    ...payInstallmentMutation,
    onSuccess: () => {
      toast.success('Installment paid');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't record payment. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      amount: installment.amount,
      paying_method: 'Cash',
      cheque_no: '',
      payment_note: ''
    },
    onSubmit: async ({ value }) => {
      await payMutation.mutateAsync({
        installmentId: installment.id,
        data: {
          amount: value.amount,
          paying_method: value.paying_method || undefined,
          cheque_no: value.cheque_no || undefined,
          payment_note: value.payment_note || undefined
        }
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Installment #{installment.id}</DialogTitle>
          <DialogDescription>Due {installment.payment_date} — Amount {installment.amount.toFixed(2)}</DialogDescription>
        </DialogHeader>

        <form
          id='pay-installment-form'
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name='amount' children={(field) => <field.TextField label='Amount' type='number' step='0.01' required />} />
            <form.AppField name='paying_method' children={(field) => <field.TextField label='Paying Method' />} />
            <form.AppField name='cheque_no' children={(field) => <field.TextField label='Cheque No (optional)' />} />
            <form.AppField name='payment_note' children={(field) => <field.TextareaField label='Payment Note' />} />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={payMutation.isPending} type='submit' form='pay-installment-form'>
            Record Payment
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
