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
import { createCustomerMutation, updateCustomerMutation } from '../api/mutations';
import { customerKeys } from '../api/queries';
import type { Customer } from '../api/types';
import { toast } from 'sonner';
import { customerSchema } from '../schemas/customer';

interface CustomerFormSheetProps {
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerFormSheet({ customer, open, onOpenChange }: CustomerFormSheetProps) {
  const isEdit = !!customer;

  const createMutation = useMutation({
    ...createCustomerMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create customer. Try again.")
  });

  const updateMutation = useMutation({
    ...updateCustomerMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update customer. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: customer?.name ?? '',
      company_name: customer?.company_name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      address: customer?.address ?? '',
      city: customer?.city ?? '',
      state: customer?.state ?? '',
      postal_code: customer?.postal_code ?? '',
      country: customer?.country ?? '',
      tax_number: customer?.tax_number ?? '',
      credit_limit: customer?.credit_limit ?? 0
    },
    validators: {
      onSubmit: customerSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        company_name: value.company_name || null,
        phone: value.phone || null,
        email: value.email || null,
        address: value.address || null,
        city: value.city || null,
        state: value.state || null,
        postal_code: value.postal_code || null,
        country: value.country || null,
        tax_number: value.tax_number || null,
        credit_limit: value.credit_limit ?? null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: customer.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Customer' : 'New Customer'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the customer details below.'
              : 'Fill in the details to create a new customer.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='customer-form-sheet'
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
                  <field.TextField label='Name' required placeholder='John Doe' />
                )}
              />

              <form.AppField
                name='company_name'
                children={(field) => (
                  <field.TextField label='Company Name' placeholder='Acme Inc.' />
                )}
              />

              <form.AppField
                name='phone'
                children={(field) => (
                  <field.TextField label='Phone' type='tel' placeholder='+1 555 000 0000' />
                )}
              />

              <form.AppField
                name='email'
                children={(field) => (
                  <field.TextField label='Email' type='email' placeholder='customer@example.com' />
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
                name='tax_number'
                children={(field) => (
                  <field.TextField label='Tax Number' placeholder='TAX-000000' />
                )}
              />

              <form.AppField
                name='credit_limit'
                children={(field) => (
                  <field.TextField
                    label='Credit Limit'
                    type='number'
                    step='0.01'
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
          <LoadingButton loading={isPending} type='submit' form='customer-form-sheet'>
            {isEdit ? 'Update Customer' : 'Create Customer'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CustomerFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <CustomerFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
