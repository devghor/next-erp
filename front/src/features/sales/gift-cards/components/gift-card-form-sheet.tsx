'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { AddButton } from '@/components/buttons/add-button';
import { getQueryClient } from '@/lib/query-client';
import { customersQueryOptions } from '@/features/people/customers/api/queries';
import { createGiftCardMutation, updateGiftCardMutation } from '../api/mutations';
import { giftCardKeys } from '../api/queries';
import type { GiftCard } from '../api/types';
import { giftCardSchema } from '../schemas/gift-card';

const NONE = 'none';

interface GiftCardFormSheetProps {
  giftCard?: GiftCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GiftCardFormSheet({ giftCard, open, onOpenChange }: GiftCardFormSheetProps) {
  const isEdit = !!giftCard;

  const { data: customersData } = useQuery({
    ...customersQueryOptions({ per_page: 100 }),
    enabled: open
  });
  const customerOptions = [
    { value: NONE, label: 'None' },
    ...(customersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))
  ];

  const createMutation = useMutation({
    ...createGiftCardMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
      toast.success('Gift card created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create gift card. Try again.")
  });

  const updateMutation = useMutation({
    ...updateGiftCardMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
      toast.success('Gift card updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update gift card. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      card_no: giftCard?.card_no ?? '',
      amount: giftCard?.amount ?? 0,
      customer_id: giftCard?.customer_id ? String(giftCard.customer_id) : NONE,
      expired_date: giftCard?.expired_date ?? ''
    },
    validators: {
      onSubmit: giftCardSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        card_no: value.card_no,
        amount: value.amount,
        customer_id: value.customer_id === NONE ? null : Number(value.customer_id),
        expired_date: value.expired_date || null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: giftCard.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Gift Card' : 'New Gift Card'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the gift card details below.'
              : 'Fill in the details to issue a new gift card.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='gift-card-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='card_no'
                children={(field) => <field.TextField label='Card Number' required placeholder='GC-0001' />}
              />

              <form.AppField
                name='amount'
                children={(field) => (
                  <field.TextField
                    label='Initial Amount'
                    type='number'
                    step='0.01'
                    required
                    placeholder='0'
                  />
                )}
              />

              <form.AppField
                name='customer_id'
                children={(field) => (
                  <field.SelectField label='Customer' options={customerOptions} />
                )}
              />

              <form.AppField
                name='expired_date'
                children={(field) => <field.TextField label='Expiry Date' type='date' />}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='gift-card-form-sheet'>
            {isEdit ? 'Update Gift Card' : 'Create Gift Card'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function GiftCardFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <GiftCardFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
