'use client';

import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/lib/form';
import { createCustomerMutation } from '@/features/people/customers/api/mutations';
import type { Customer } from '@/features/people/customers/api/types';

const quickAddSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string(),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')])
});

export interface PosCustomerQuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
}

/** Minimal customer-creation dialog for mid-checkout use — full detail (address/tax/credit-limit) stays on the admin customer form. */
export function PosCustomerQuickAddDialog({ open, onOpenChange, onCreated }: PosCustomerQuickAddDialogProps) {
  const createMutation = useMutation({
    ...createCustomerMutation,
    onSuccess: (customer) => {
      toast.success('Customer created');
      onCreated(customer);
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create customer. Try again.")
  });

  const form = useAppForm({
    defaultValues: { name: '', phone: '', email: '' },
    validators: { onSubmit: quickAddSchema },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        name: value.name,
        phone: value.phone || null,
        email: value.email || null
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
          <DialogDescription>Quickly add a walk-in customer without leaving checkout.</DialogDescription>
        </DialogHeader>

        <form
          id='pos-customer-quick-add'
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name='name' children={(field) => <field.TextField label='Name' required placeholder='John Doe' autoFocus />} />
            <form.AppField name='phone' children={(field) => <field.TextField label='Phone' type='tel' placeholder='+1 555 000 0000' />} />
            <form.AppField name='email' children={(field) => <field.TextField label='Email' type='email' placeholder='customer@example.com' />} />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={createMutation.isPending} type='submit' form='pos-customer-quick-add'>
            Create Customer
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
