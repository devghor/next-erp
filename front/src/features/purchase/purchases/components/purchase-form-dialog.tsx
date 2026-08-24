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
import { suppliersQueryOptions } from '@/features/people/suppliers/api/queries';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import { createPurchaseMutation, updatePurchaseMutation } from '../api/mutations';
import { purchaseKeys } from '../api/queries';
import { purchaseSchema } from '../schemas/purchase';
import type { PurchaseItemFormValues } from '../schemas/purchase';
import type { Purchase } from '../api/types';
import { PurchaseItemsEditor } from './purchase-items-editor';

const NONE = 'none';

interface PurchaseFormDialogProps {
  purchase?: Purchase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseFormDialog({ purchase, open, onOpenChange }: PurchaseFormDialogProps) {
  const isEdit = !!purchase;

  const { data: warehousesData } = useQuery({ ...warehousesQueryOptions({ per_page: 100 }), enabled: open });
  const { data: suppliersData } = useQuery({ ...suppliersQueryOptions({ per_page: 100 }), enabled: open });
  const { data: productsData } = useQuery({ ...productsQueryOptions({ per_page: 200 }), enabled: open });

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const supplierOptions = [
    { value: NONE, label: 'None' },
    ...(suppliersData?.data ?? []).map((s) => ({ value: String(s.id), label: s.name }))
  ];
  const productOptions = (productsData?.data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
    cost: p.cost
  }));

  const [items, setItems] = useState<PurchaseItemFormValues[]>(
    purchase?.items?.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      net_unit_cost: item.net_unit_cost,
      discount: item.discount ?? 0,
      tax_rate: item.tax_rate ?? 0
    })) ?? []
  );

  const createMutation = useMutation({
    ...createPurchaseMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success('Purchase created');
      onOpenChange(false);
      form.reset();
      setItems([]);
    },
    onError: () => toast.error("Couldn't create purchase. Try again.")
  });

  const updateMutation = useMutation({
    ...updatePurchaseMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success('Purchase updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update purchase. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      supplier_id: purchase?.supplier_id ? String(purchase.supplier_id) : NONE,
      warehouse_id: purchase?.warehouse_id ? String(purchase.warehouse_id) : '',
      order_tax: purchase?.order_tax ?? 0,
      paid_amount: purchase?.paid_amount ?? 0,
      paying_method: 'Cash',
      note: purchase?.note ?? ''
    },
    validators: {
      onSubmit: purchaseSchema
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
        supplier_id: value.supplier_id === NONE ? null : Number(value.supplier_id),
        warehouse_id: Number(value.warehouse_id),
        order_tax: value.order_tax,
        paid_amount: value.paid_amount,
        paying_method: value.paying_method,
        note: value.note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          net_unit_cost: item.net_unit_cost,
          discount: item.discount,
          tax_rate: item.tax_rate
        }))
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: purchase.id, values: payload });
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
          <DialogTitle>{isEdit ? 'Edit Purchase' : 'New Purchase'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the purchase details below.' : 'Receive stock by recording a purchase.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-auto p-1'>
          <form
            id='purchase-form-dialog'
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
                name='supplier_id'
                children={(field) => <field.SelectField label='Supplier' options={supplierOptions} />}
              />
              <form.AppField
                name='order_tax'
                children={(field) => <field.TextField label='Order Tax' type='number' />}
              />
              <form.AppField
                name='paid_amount'
                children={(field) => <field.TextField label='Paid Amount' type='number' />}
              />
              <form.AppField
                name='paying_method'
                children={(field) => <field.TextField label='Paying Method' placeholder='Cash' />}
              />
              <form.AppField name='note' children={(field) => <field.TextareaField label='Note' />} />
            </FieldGroup>

            <PurchaseItemsEditor items={items} onChange={setItems} productOptions={productOptions} />
          </form>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='purchase-form-dialog'>
            {isEdit ? 'Update Purchase' : 'Create Purchase'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PurchaseFormDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <PurchaseFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
