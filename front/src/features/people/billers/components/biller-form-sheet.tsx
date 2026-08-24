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
import { createBillerMutation, updateBillerMutation } from '../api/mutations';
import { billerKeys } from '../api/queries';
import type { Biller } from '../api/types';
import { toast } from 'sonner';
import { billerSchema } from '../schemas/biller';

interface BillerFormSheetProps {
  biller?: Biller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillerFormSheet({ biller, open, onOpenChange }: BillerFormSheetProps) {
  const isEdit = !!biller;

  const createMutation = useMutation({
    ...createBillerMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
      toast.success('Biller created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create biller. Try again.")
  });

  const updateMutation = useMutation({
    ...updateBillerMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: billerKeys.all });
      toast.success('Biller updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update biller. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: biller?.name ?? '',
      company_name: biller?.company_name ?? '',
      email: biller?.email ?? '',
      phone: biller?.phone ?? '',
      address: biller?.address ?? '',
      city: biller?.city ?? '',
      state: biller?.state ?? '',
      postal_code: biller?.postal_code ?? '',
      country: biller?.country ?? '',
      vat_number: biller?.vat_number ?? ''
    },
    validators: {
      onSubmit: billerSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        company_name: value.company_name || null,
        email: value.email || null,
        phone: value.phone || null,
        address: value.address || null,
        city: value.city || null,
        state: value.state || null,
        postal_code: value.postal_code || null,
        country: value.country || null,
        vat_number: value.vat_number || null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: biller.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Biller' : 'New Biller'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update the biller details below.' : 'Fill in the details to create a new biller.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='biller-form-sheet'
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
                  <field.TextField label='Name' required placeholder='Acme Billing Co.' />
                )}
              />

              <form.AppField
                name='company_name'
                children={(field) => (
                  <field.TextField label='Company Name' placeholder='Acme Inc.' />
                )}
              />

              <form.AppField
                name='email'
                children={(field) => (
                  <field.TextField label='Email' type='email' placeholder='biller@example.com' />
                )}
              />

              <form.AppField
                name='phone'
                children={(field) => (
                  <field.TextField label='Phone' type='tel' placeholder='+1 555 000 0000' />
                )}
              />

              <form.AppField
                name='address'
                children={(field) => (
                  <field.TextField label='Address' placeholder='123 Main St' />
                )}
              />

              <form.AppField
                name='city'
                children={(field) => <field.TextField label='City' placeholder='New York' />}
              />

              <form.AppField
                name='state'
                children={(field) => <field.TextField label='State' placeholder='NY' />}
              />

              <form.AppField
                name='postal_code'
                children={(field) => (
                  <field.TextField label='Postal Code' placeholder='10001' />
                )}
              />

              <form.AppField
                name='country'
                children={(field) => (
                  <field.TextField label='Country' placeholder='United States' />
                )}
              />

              <form.AppField
                name='vat_number'
                children={(field) => (
                  <field.TextField label='VAT Number' placeholder='VAT123456' />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='biller-form-sheet'>
            {isEdit ? 'Update Biller' : 'Create Biller'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function BillerFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <BillerFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
