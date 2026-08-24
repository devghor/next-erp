'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AddButton } from '@/components/buttons/add-button';
import { useAppForm } from '@/lib/form';
import { getQueryClient } from '@/lib/query-client';
import { createCouponMutation, updateCouponMutation } from '../api/mutations';
import { generateCouponCode } from '../api/service';
import { couponKeys } from '../api/queries';
import { couponSchema } from '../schemas/coupon';
import type { Coupon } from '../api/types';

const TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed amount' },
  { value: 'percentage', label: 'Percentage' }
];

interface CouponFormDialogProps {
  coupon?: Coupon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponFormDialog({ coupon, open, onOpenChange }: CouponFormDialogProps) {
  const isEdit = !!coupon;
  const [generating, setGenerating] = useState(false);

  const createMutation = useMutation({
    ...createCouponMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
      toast.success('Coupon created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create coupon. Try again.")
  });

  const updateMutation = useMutation({
    ...updateCouponMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
      toast.success('Coupon updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update coupon. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      code: coupon?.code ?? '',
      name: coupon?.name ?? '',
      type: coupon?.type ?? 'fixed',
      amount: coupon?.amount ?? 0,
      minimum_amount: coupon?.minimum_amount ?? 0,
      quantity: coupon?.quantity ?? 0,
      expired_date: coupon?.expired_date ? new Date(coupon.expired_date) : new Date()
    },
    validators: {
      onSubmit: couponSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        code: value.code,
        name: value.name || null,
        type: value.type,
        amount: value.amount,
        minimum_amount: value.type === 'percentage' ? 0 : value.minimum_amount,
        quantity: value.quantity,
        expired_date: value.expired_date.toISOString().slice(0, 10)
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: coupon.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the coupon details below.' : 'Create a discount coupon customers can redeem at checkout.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-auto p-1'>
          <form
            id='coupon-form-dialog'
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='code'
                children={(field) => (
                  <div className='flex items-end gap-2'>
                    <div className='flex-1'>
                      <field.TextField label='Code' required placeholder='SAVE10' />
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      disabled={generating}
                      onClick={async () => {
                        setGenerating(true);
                        try {
                          const code = await generateCouponCode();
                          field.handleChange(code);
                        } catch {
                          toast.error("Couldn't generate a code");
                        } finally {
                          setGenerating(false);
                        }
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                )}
              />
              <form.AppField
                name='name'
                children={(field) => <field.TextField label='Name' placeholder='Summer Sale' />}
              />
              <form.AppField
                name='type'
                children={(field) => <field.SelectField label='Type' required options={TYPE_OPTIONS} />}
              />
              <form.AppField
                name='amount'
                children={(field) => <field.TextField label='Amount' type='number' step='0.01' required />}
              />
              <form.Subscribe selector={(state) => state.values.type}>
                {(type) =>
                  type !== 'percentage' && (
                    <form.AppField
                      name='minimum_amount'
                      children={(field) => (
                        <field.TextField label='Minimum Order Amount' type='number' step='0.01' />
                      )}
                    />
                  )
                }
              </form.Subscribe>
              <form.AppField
                name='quantity'
                children={(field) => <field.TextField label='Quantity Available' type='number' required />}
              />
              <form.AppField
                name='expired_date'
                children={(field) => <field.DatePickerField label='Expires On' required />}
              />
            </FieldGroup>
          </form>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='coupon-form-dialog'>
            {isEdit ? 'Update Coupon' : 'Create Coupon'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CouponFormDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <CouponFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
