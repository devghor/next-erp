'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AddButton } from '@/components/buttons/add-button';
import { useAppForm } from '@/lib/form';
import { getQueryClient } from '@/lib/query-client';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import { createAdjustmentMutation, updateAdjustmentMutation } from '../api/mutations';
import { adjustmentKeys } from '../api/queries';
import { adjustmentSchema } from '../schemas/adjustment';
import type { AdjustmentItemFormValues } from '../schemas/adjustment';
import type { Adjustment } from '../api/types';
import { AdjustmentItemsEditor } from './adjustment-items-editor';

interface AdjustmentFormDialogProps {
  adjustment?: Adjustment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdjustmentFormDialog({
  adjustment,
  open,
  onOpenChange
}: AdjustmentFormDialogProps) {
  const isEdit = !!adjustment;

  const { data: warehousesData } = useQuery({
    ...warehousesQueryOptions({ per_page: 100 }),
    enabled: open
  });
  const { data: productsData } = useQuery({
    ...productsQueryOptions({ per_page: 200 }),
    enabled: open
  });

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({
    value: String(w.id),
    label: w.name
  }));
  const productOptions = (productsData?.data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
    cost: p.cost
  }));

  const [items, setItems] = useState<AdjustmentItemFormValues[]>(
    adjustment?.items?.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      action: item.action,
      qty: item.qty,
      unit_cost: item.unit_cost ?? 0
    })) ?? []
  );

  const createMutation = useMutation({
    ...createAdjustmentMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
      toast.success('Adjustment created');
      onOpenChange(false);
      form.reset();
      setItems([]);
    },
    onError: () => toast.error("Couldn't create adjustment. Try again.")
  });

  const updateMutation = useMutation({
    ...updateAdjustmentMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
      toast.success('Adjustment updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update adjustment. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      warehouse_id: adjustment?.warehouse_id ? String(adjustment.warehouse_id) : '',
      note: adjustment?.note ?? ''
    },
    validators: {
      onSubmit: adjustmentSchema
    },
    onSubmit: async ({ value }) => {
      if (items.length === 0) {
        toast.error('Add at least one item');
        return;
      }
      if (items.some((item) => !item.product_id || item.qty <= 0)) {
        toast.error('Every item needs a product and a qty greater than 0');
        return;
      }

      const payload = {
        warehouse_id: Number(value.warehouse_id),
        note: value.note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          action: item.action,
          qty: item.qty,
          unit_cost: item.unit_cost
        }))
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: adjustment.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Adjustment' : 'New Adjustment'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the stock adjustment below.'
              : 'Correct stock levels by adding or removing quantity.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-auto p-1'>
          <form
            id='adjustment-form-dialog'
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='warehouse_id'
                children={(field) => (
                  <field.SelectField label='Warehouse' required options={warehouseOptions} />
                )}
              />
              <form.AppField
                name='note'
                children={(field) => <field.TextareaField label='Note' />}
              />
            </FieldGroup>

            <AdjustmentItemsEditor
              items={items}
              onChange={setItems}
              productOptions={productOptions}
            />
          </form>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='adjustment-form-dialog'>
            {isEdit ? 'Update Adjustment' : 'Create Adjustment'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdjustmentFormDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <AdjustmentFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
