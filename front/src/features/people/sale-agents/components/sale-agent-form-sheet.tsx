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
import { createSaleAgentMutation, updateSaleAgentMutation } from '../api/mutations';
import { saleAgentKeys } from '../api/queries';
import type { SaleAgent } from '../api/types';
import { toast } from 'sonner';
import { saleAgentSchema } from '../schemas/sale-agent';

interface SaleAgentFormSheetProps {
  saleAgent?: SaleAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleAgentFormSheet({ saleAgent, open, onOpenChange }: SaleAgentFormSheetProps) {
  const isEdit = !!saleAgent;

  const createMutation = useMutation({
    ...createSaleAgentMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
      toast.success('Sale agent created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create sale agent. Try again.")
  });

  const updateMutation = useMutation({
    ...updateSaleAgentMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: saleAgentKeys.all });
      toast.success('Sale agent updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update sale agent. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: saleAgent?.name ?? '',
      phone: saleAgent?.phone ?? '',
      email: saleAgent?.email ?? '',
      address: saleAgent?.address ?? '',
      commission_rate: saleAgent?.commission_rate ?? 0
    },
    validators: {
      onSubmit: saleAgentSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        phone: value.phone || null,
        email: value.email || null,
        address: value.address || null,
        commission_rate: value.commission_rate ?? null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: saleAgent.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Sale Agent' : 'New Sale Agent'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the sale agent details below.'
              : 'Fill in the details to create a new sale agent.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='sale-agent-form-sheet'
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
                  <field.TextField label='Name' required placeholder='Jane Smith' />
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
                  <field.TextField label='Email' type='email' placeholder='agent@example.com' />
                )}
              />

              <form.AppField
                name='address'
                children={(field) => (
                  <field.TextField label='Address' placeholder='123 Main St' />
                )}
              />

              <form.AppField
                name='commission_rate'
                children={(field) => (
                  <field.TextField
                    label='Commission Rate (%)'
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
          <LoadingButton loading={isPending} type='submit' form='sale-agent-form-sheet'>
            {isEdit ? 'Update Sale Agent' : 'Create Sale Agent'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function SaleAgentFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <SaleAgentFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
