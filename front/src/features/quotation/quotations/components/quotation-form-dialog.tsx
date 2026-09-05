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
import { customersQueryOptions } from '@/features/people/customers/api/queries';
import { billersQueryOptions } from '@/features/people/billers/api/queries';
import { suppliersQueryOptions } from '@/features/people/suppliers/api/queries';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import { createQuotationMutation, updateQuotationMutation } from '../api/mutations';
import { quotationKeys } from '../api/queries';
import { quotationSchema } from '../schemas/quotation';
import type { QuotationItemFormValues } from '../schemas/quotation';
import type { Quotation } from '../api/types';
import { QuotationItemsEditor } from './quotation-items-editor';

const NONE = 'none';

interface QuotationFormDialogProps {
  quotation?: Quotation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationFormDialog({ quotation, open, onOpenChange }: QuotationFormDialogProps) {
  const isEdit = !!quotation;

  const { data: warehousesData } = useQuery({ ...warehousesQueryOptions({ per_page: 100 }), enabled: open });
  const { data: customersData } = useQuery({ ...customersQueryOptions({ per_page: 200 }), enabled: open });
  const { data: billersData } = useQuery({ ...billersQueryOptions({ per_page: 100 }), enabled: open });
  const { data: suppliersData } = useQuery({ ...suppliersQueryOptions({ per_page: 100 }), enabled: open });
  const { data: productsData } = useQuery({ ...productsQueryOptions({ per_page: 200 }), enabled: open });

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const customerOptions = (customersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }));
  const billerOptions = [
    { value: NONE, label: 'None' },
    ...(billersData?.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))
  ];
  const supplierOptions = [
    { value: NONE, label: 'None' },
    ...(suppliersData?.data ?? []).map((s) => ({ value: String(s.id), label: s.name }))
  ];
  const productOptions = (productsData?.data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
    price: p.price
  }));

  const [items, setItems] = useState<QuotationItemFormValues[]>(
    quotation?.items?.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      net_unit_price: item.net_unit_price,
      discount: item.discount ?? 0,
      tax_rate: item.tax_rate ?? 0
    })) ?? []
  );
  const [document, setDocument] = useState<File | null>(null);

  const createMutation = useMutation({
    ...createQuotationMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
      toast.success('Quotation created');
      onOpenChange(false);
      form.reset();
      setItems([]);
      setDocument(null);
    },
    onError: () => toast.error("Couldn't create quotation. Try again.")
  });

  const updateMutation = useMutation({
    ...updateQuotationMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
      toast.success('Quotation updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update quotation. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      customer_id: quotation?.customer_id ? String(quotation.customer_id) : '',
      warehouse_id: quotation?.warehouse_id ? String(quotation.warehouse_id) : '',
      biller_id: quotation?.biller_id ? String(quotation.biller_id) : NONE,
      supplier_id: quotation?.supplier_id ? String(quotation.supplier_id) : NONE,
      order_tax_rate: quotation?.order_tax_rate ?? 0,
      order_tax: quotation?.order_tax ?? 0,
      order_discount: quotation?.order_discount ?? 0,
      shipping_cost: quotation?.shipping_cost ?? 0,
      quotation_status: quotation?.quotation_status ?? 'pending',
      note: quotation?.note ?? ''
    },
    validators: {
      onSubmit: quotationSchema
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
        customer_id: Number(value.customer_id),
        warehouse_id: Number(value.warehouse_id),
        biller_id: value.biller_id === NONE ? null : Number(value.biller_id),
        supplier_id: value.supplier_id === NONE ? null : Number(value.supplier_id),
        order_tax_rate: value.order_tax_rate,
        order_tax: value.order_tax,
        order_discount: value.order_discount,
        shipping_cost: value.shipping_cost,
        quotation_status: value.quotation_status as 'pending' | 'sent',
        document,
        note: value.note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          net_unit_price: item.net_unit_price,
          discount: item.discount,
          tax_rate: item.tax_rate
        }))
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: quotation.id, values: payload });
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
          <DialogTitle>{isEdit ? 'Edit Quotation' : 'New Quotation'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the quotation details below.' : 'Prepare a price quote for a customer.'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-4 overflow-auto p-1'>
          <form
            id='quotation-form-dialog'
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField
                name='customer_id'
                children={(field) => (
                  <field.SelectField label='Customer' required options={customerOptions} />
                )}
              />
              <form.AppField
                name='warehouse_id'
                children={(field) => (
                  <field.SelectField label='Warehouse' required options={warehouseOptions} />
                )}
              />
              <form.AppField
                name='biller_id'
                children={(field) => <field.SelectField label='Biller' options={billerOptions} />}
              />
              <form.AppField
                name='supplier_id'
                children={(field) => <field.SelectField label='Supplier' options={supplierOptions} />}
              />
              <form.AppField
                name='quotation_status'
                children={(field) => (
                  <field.SelectField
                    label='Status'
                    required
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'sent', label: 'Sent' }
                    ]}
                  />
                )}
              />
              <form.AppField
                name='order_tax_rate'
                children={(field) => <field.TextField label='Order Tax Rate %' type='number' />}
              />
              <form.AppField
                name='order_tax'
                children={(field) => <field.TextField label='Order Tax' type='number' />}
              />
              <form.AppField
                name='order_discount'
                children={(field) => <field.TextField label='Order Discount' type='number' />}
              />
              <form.AppField
                name='shipping_cost'
                children={(field) => <field.TextField label='Shipping Cost' type='number' />}
              />
              <Field>
                <FieldLabel htmlFor='quotation-document'>Document</FieldLabel>
                <Input
                  id='quotation-document'
                  type='file'
                  onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
                />
                {quotation?.document_url && !document && (
                  <a
                    href={quotation.document_url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-primary text-xs underline'
                  >
                    View current document
                  </a>
                )}
              </Field>
              <form.AppField name='note' children={(field) => <field.TextareaField label='Note' />} />
            </FieldGroup>

            <QuotationItemsEditor items={items} onChange={setItems} productOptions={productOptions} />
          </form>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='quotation-form-dialog'>
            {isEdit ? 'Update Quotation' : 'Create Quotation'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QuotationFormDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <QuotationFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
