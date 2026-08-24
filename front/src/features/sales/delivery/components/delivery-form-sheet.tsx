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
import { salesQueryOptions } from '@/features/sales/sales/api/queries';
import { couriersQueryOptions } from '@/features/sales/couriers/api/queries';
import { createDeliveryMutation } from '../api/mutations';
import { deliveryKeys } from '../api/queries';
import { deliverySchema } from '../schemas/delivery';

const NONE = 'none';

interface DeliveryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliveryFormSheet({ open, onOpenChange }: DeliveryFormSheetProps) {
  const { data: salesData } = useQuery({
    ...salesQueryOptions({ per_page: 100, sale_status: 'completed' }),
    enabled: open
  });
  const saleOptions = (salesData?.data ?? []).map((s) => ({
    value: String(s.id),
    label: `${s.reference_no} — ${s.customer_name ?? ''}`
  }));

  const { data: couriersData } = useQuery({
    ...couriersQueryOptions({ per_page: 100 }),
    enabled: open
  });
  const courierOptions = [
    { value: NONE, label: 'Manual (no courier API)' },
    ...(couriersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))
  ];

  const createMutation = useMutation({
    ...createDeliveryMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success('Delivery created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create delivery. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      sale_id: '',
      courier_id: NONE,
      address: '',
      delivered_by: '',
      recieved_by: '',
      note: ''
    },
    validators: {
      onSubmit: deliverySchema
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        sale_id: Number(value.sale_id),
        courier_id: value.courier_id === NONE ? null : Number(value.courier_id),
        address: value.address || null,
        delivered_by: value.delivered_by || null,
        recieved_by: value.recieved_by || null,
        note: value.note || null
      });
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>New Delivery</SheetTitle>
          <SheetDescription>
            Assign a completed sale to a courier, or mark it for manual delivery.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='delivery-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='sale_id'
                children={(field) => (
                  <field.SelectField label='Sale' required options={saleOptions} />
                )}
              />

              <form.AppField
                name='courier_id'
                children={(field) => (
                  <field.SelectField label='Courier' options={courierOptions} />
                )}
              />

              <form.AppField
                name='address'
                children={(field) => <field.TextareaField label='Delivery Address' />}
              />

              <form.AppField
                name='delivered_by'
                children={(field) => <field.TextField label='Delivered By' />}
              />

              <form.AppField
                name='recieved_by'
                children={(field) => <field.TextField label='Received By' />}
              />

              <form.AppField
                name='note'
                children={(field) => <field.TextareaField label='Note' />}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={createMutation.isPending} type='submit' form='delivery-form-sheet'>
            Create Delivery
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function DeliveryFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <DeliveryFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
