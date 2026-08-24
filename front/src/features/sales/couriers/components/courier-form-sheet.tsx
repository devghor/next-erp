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
import { createCourierMutation, updateCourierMutation } from '../api/mutations';
import { courierKeys } from '../api/queries';
import type { Courier } from '../api/types';
import { toast } from 'sonner';
import { courierSchema } from '../schemas/courier';

interface CourierFormSheetProps {
  courier?: Courier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'steadfast', label: 'Steadfast' },
  { value: 'pathao', label: 'Pathao' }
];

export function CourierFormSheet({ courier, open, onOpenChange }: CourierFormSheetProps) {
  const isEdit = !!courier;

  const createMutation = useMutation({
    ...createCourierMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
      toast.success('Courier created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create courier. Try again.")
  });

  const updateMutation = useMutation({
    ...updateCourierMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
      toast.success('Courier updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update courier. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: courier?.name ?? '',
      type: courier?.type ?? 'manual',
      phone_number: courier?.phone_number ?? '',
      address: courier?.address ?? '',
      api_key: courier?.api_key ?? '',
      secret_key: courier?.secret_key ?? '',
      client_id: courier?.client_id ?? '',
      client_secret: courier?.client_secret ?? '',
      username: courier?.username ?? '',
      password: courier?.password ?? '',
      base_url: courier?.base_url ?? ''
    },
    validators: {
      onSubmit: courierSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        type: value.type as Courier['type'],
        phone_number: value.phone_number || null,
        address: value.address || null,
        api_key: value.api_key || null,
        secret_key: value.secret_key || null,
        client_id: value.client_id || null,
        client_secret: value.client_secret || null,
        username: value.username || null,
        password: value.password || null,
        base_url: value.base_url || null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: courier.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Courier' : 'New Courier'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the courier details below.'
              : 'Fill in the details to connect a new courier.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='courier-form-sheet'
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
                  <field.TextField label='Name' required placeholder='My Courier' />
                )}
              />

              <form.AppField
                name='type'
                children={(field) => (
                  <field.SelectField label='Type' required options={TYPE_OPTIONS} />
                )}
              />

              <form.AppField
                name='phone_number'
                children={(field) => (
                  <field.TextField label='Phone Number' type='tel' placeholder='+1 555 000 0000' />
                )}
              />

              <form.AppField
                name='address'
                children={(field) => (
                  <field.TextField label='Address' placeholder='123 Main St' />
                )}
              />

              <form.Subscribe selector={(state) => state.values.type}>
                {(selectedType) => (
                  <>
                    {selectedType === 'steadfast' && (
                      <>
                        <form.AppField
                          name='api_key'
                          children={(field) => <field.TextField label='API Key' />}
                        />
                        <form.AppField
                          name='secret_key'
                          children={(field) => <field.TextField label='Secret Key' />}
                        />
                      </>
                    )}

                    {selectedType === 'pathao' && (
                      <>
                        <form.AppField
                          name='base_url'
                          children={(field) => (
                            <field.TextField
                              label='Base URL'
                              placeholder='https://api-hermes.pathao.com'
                            />
                          )}
                        />
                        <form.AppField
                          name='client_id'
                          children={(field) => <field.TextField label='Client ID' />}
                        />
                        <form.AppField
                          name='client_secret'
                          children={(field) => <field.TextField label='Client Secret' />}
                        />
                        <form.AppField
                          name='username'
                          children={(field) => <field.TextField label='Username' />}
                        />
                        <form.AppField
                          name='password'
                          children={(field) => (
                            <field.TextField label='Password' type='password' />
                          )}
                        />
                      </>
                    )}
                  </>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='courier-form-sheet'>
            {isEdit ? 'Update Courier' : 'Create Courier'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CourierFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <CourierFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
