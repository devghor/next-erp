'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { createDamageStockMutation, updateDamageStockMutation } from '../api/mutations';
import { damageStockKeys } from '../api/queries';
import { damageStockSchema } from '../schemas/damage-stock';
import type { DamageStockItemFormValues } from '../schemas/damage-stock';
import type { DamageStock } from '../api/types';
import { DamageStockItemsEditor } from './damage-stock-items-editor';

interface DamageStockFormDialogProps {
  damageStock?: DamageStock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DamageStockFormDialog({
  damageStock,
  open,
  onOpenChange
}: DamageStockFormDialogProps) {
  const isEdit = !!damageStock;

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

  const [items, setItems] = useState<DamageStockItemFormValues[]>(
    damageStock?.items?.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      unit_cost: item.unit_cost ?? 0
    })) ?? []
  );
  const [document, setDocument] = useState<File | null>(null);

  const createMutation = useMutation({
    ...createDamageStockMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
      toast.success('Damage stock created');
      onOpenChange(false);
      form.reset();
      setItems([]);
      setDocument(null);
    },
    onError: () => toast.error("Couldn't create damage stock. Try again.")
  });

  const updateMutation = useMutation({
    ...updateDamageStockMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
      toast.success('Damage stock updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update damage stock. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      warehouse_id: damageStock?.warehouse_id ? String(damageStock.warehouse_id) : '',
      damaged_at: damageStock?.damaged_at ?? new Date().toISOString().slice(0, 10),
      note: damageStock?.note ?? ''
    },
    validators: {
      onSubmit: damageStockSchema
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
        damaged_at: value.damaged_at,
        document,
        note: value.note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          unit_cost: item.unit_cost
        }))
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: damageStock.id, values: payload });
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
          <DialogTitle>{isEdit ? 'Edit Damage Stock' : 'New Damage Stock'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the damaged stock entry below.'
              : 'Record damaged products and deduct them from stock.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-auto p-1'>
          <form
            id='damage-stock-form-dialog'
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
                name='damaged_at'
                children={(field) => <field.TextField label='Damaged At' type='date' required />}
              />
              <Field>
                <FieldLabel htmlFor='damage-stock-document'>Document</FieldLabel>
                <Input
                  id='damage-stock-document'
                  type='file'
                  onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
                />
                {damageStock?.document_url && !document && (
                  <a
                    href={damageStock.document_url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-primary text-xs underline'
                  >
                    View current document
                  </a>
                )}
              </Field>
              <form.AppField
                name='note'
                children={(field) => <field.TextareaField label='Note' />}
              />
            </FieldGroup>

            <DamageStockItemsEditor
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
          <LoadingButton loading={isPending} type='submit' form='damage-stock-form-dialog'>
            {isEdit ? 'Update Damage Stock' : 'Create Damage Stock'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DamageStockFormDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <DamageStockFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
