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
import { createSupplierMutation, updateSupplierMutation } from '../api/mutations';
import { supplierKeys } from '../api/queries';
import type { Supplier } from '../api/types';
import { toast } from 'sonner';
import { supplierSchema } from '../schemas/supplier';

interface SupplierFormSheetProps {
  supplier?: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierFormSheet({ supplier, open, onOpenChange }: SupplierFormSheetProps) {
  const isEdit = !!supplier;

  const createMutation = useMutation({
    ...createSupplierMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create supplier. Try again.")
  });

  const updateMutation = useMutation({
    ...updateSupplierMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update supplier. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? ''
    },
    validators: {
      onSubmit: supplierSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        phone: value.phone || null,
        email: value.email || null,
        address: value.address || null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: supplier.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Supplier' : 'New Supplier'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the supplier details below.'
              : 'Fill in the details to create a new supplier.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='supplier-form-sheet'
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
                  <field.TextField label='Name' required placeholder='Acme Distributors' />
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
                  <field.TextField label='Email' type='email' placeholder='supplier@example.com' />
                )}
              />

              <form.AppField
                name='address'
                children={(field) => (
                  <field.TextField label='Address' placeholder='123 Main St' />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='supplier-form-sheet'>
            {isEdit ? 'Update Supplier' : 'Create Supplier'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function SupplierFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <SupplierFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
