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
import { createWarehouseMutation, updateWarehouseMutation } from '../api/mutations';
import { warehouseKeys } from '../api/queries';
import type { Warehouse } from '../api/types';
import { toast } from 'sonner';
import { warehouseSchema } from '../schemas/warehouse';

interface WarehouseFormSheetProps {
  warehouse?: Warehouse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseFormSheet({ warehouse, open, onOpenChange }: WarehouseFormSheetProps) {
  const isEdit = !!warehouse;

  const createMutation = useMutation({
    ...createWarehouseMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
      toast.success('Warehouse created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create warehouse. Try again.")
  });

  const updateMutation = useMutation({
    ...updateWarehouseMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: warehouseKeys.all });
      toast.success('Warehouse updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update warehouse. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: warehouse?.name ?? '',
      phone: warehouse?.phone ?? '',
      email: warehouse?.email ?? '',
      address: warehouse?.address ?? ''
    },
    validators: {
      onSubmit: warehouseSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        phone: value.phone || null,
        email: value.email || null,
        address: value.address || null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: warehouse.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Warehouse' : 'New Warehouse'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the warehouse details below.'
              : 'Fill in the details to create a new warehouse.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='warehouse-form-sheet'
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
                  <field.TextField label='Name' required placeholder='Main Warehouse' />
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
                  <field.TextField
                    label='Email'
                    type='email'
                    placeholder='warehouse@example.com'
                  />
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
          <LoadingButton loading={isPending} type='submit' form='warehouse-form-sheet'>
            {isEdit ? 'Update Warehouse' : 'Create Warehouse'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function WarehouseFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <WarehouseFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
