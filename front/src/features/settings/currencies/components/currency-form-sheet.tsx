'use client';

import { useState } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createCurrencyMutation, updateCurrencyMutation } from '../api/mutations';
import { currencyKeys } from '../api/queries';
import type { Currency } from '../api/types';
import { toast } from 'sonner';
import { currencySchema } from '../schemas/currency';

interface CurrencyFormSheetProps {
  currency?: Currency;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CurrencyFormSheet({ currency, open, onOpenChange }: CurrencyFormSheetProps) {
  const isEdit = !!currency;

  const createMutation = useMutation({
    ...createCurrencyMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
      toast.success('Currency created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create currency. Try again.")
  });

  const updateMutation = useMutation({
    ...updateCurrencyMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
      toast.success('Currency updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update currency. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: currency?.name ?? '',
      code: currency?.code ?? '',
      symbol: currency?.symbol ?? '',
      exchange_rate: currency?.exchange_rate ?? 1
    },
    validators: {
      onSubmit: currencySchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        code: value.code,
        symbol: value.symbol || null,
        exchange_rate: value.exchange_rate
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: currency.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Currency' : 'New Currency'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the currency details below.'
              : 'Fill in the details to create a new currency.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='currency-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='name'
                children={(field) => (
                  <field.TextField label='Name' required placeholder='US Dollar' />
                )}
              />

              <form.AppField
                name='code'
                children={(field) => <field.TextField label='Code' required placeholder='USD' />}
              />

              <form.AppField
                name='symbol'
                children={(field) => <field.TextField label='Symbol' placeholder='$' />}
              />

              <form.AppField
                name='exchange_rate'
                children={(field) => (
                  <field.TextField
                    label='Exchange Rate'
                    type='number'
                    step='0.0001'
                    required
                    placeholder='1'
                  />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='currency-form-sheet'>
            {isEdit ? 'Update Currency' : 'Create Currency'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CurrencyFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <CurrencyFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
