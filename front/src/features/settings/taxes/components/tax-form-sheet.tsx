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
import { createTaxMutation, updateTaxMutation } from '../api/mutations';
import { taxKeys } from '../api/queries';
import type { Tax } from '../api/types';
import { toast } from 'sonner';
import { taxSchema } from '../schemas/tax';

interface TaxFormSheetProps {
  tax?: Tax;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaxFormSheet({ tax, open, onOpenChange }: TaxFormSheetProps) {
  const isEdit = !!tax;

  const createMutation = useMutation({
    ...createTaxMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
      toast.success('Tax created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create tax. Try again.")
  });

  const updateMutation = useMutation({
    ...updateTaxMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: taxKeys.all });
      toast.success('Tax updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update tax. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: tax?.name ?? '',
      rate: tax?.rate ?? 0
    },
    validators: {
      onSubmit: taxSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        rate: value.rate
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: tax.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Tax' : 'New Tax'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update the tax details below.' : 'Fill in the details to create a new tax.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='tax-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='name'
                children={(field) => <field.TextField label='Name' required placeholder='VAT' />}
              />

              <form.AppField
                name='rate'
                children={(field) => (
                  <field.TextField
                    label='Rate (%)'
                    type='number'
                    step='0.01'
                    required
                    placeholder='0'
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
          <LoadingButton loading={isPending} type='submit' form='tax-form-sheet'>
            {isEdit ? 'Update Tax' : 'Create Tax'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function TaxFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <TaxFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
