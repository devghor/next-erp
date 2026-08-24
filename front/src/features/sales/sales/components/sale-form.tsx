'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAppForm } from '@/lib/form';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { customersQueryOptions } from '@/features/people/customers/api/queries';
import { billersQueryOptions } from '@/features/people/billers/api/queries';
import { currenciesQueryOptions } from '@/features/settings/currencies/api/queries';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import { createSaleMutation, updateSaleMutation } from '../api/mutations';
import { saleSchema } from '../schemas/sale';
import type { SaleItemFormValues } from '../schemas/sale';
import type { Sale, SalePaymentInput } from '../api/types';
import { SaleItemsEditor, rowTotal } from './sale-items-editor';
import { SalePaymentsEditor } from './sale-payments-editor';

const NONE = 'none';

interface SaleFormProps {
  sale?: Sale;
  onSuccess: (sale: Sale) => void;
  onCancel: () => void;
}

export function SaleForm({ sale, onSuccess, onCancel }: SaleFormProps) {
  const isEdit = !!sale;

  const { data: warehousesData } = useQuery(warehousesQueryOptions({ per_page: 100 }));
  const { data: customersData } = useQuery(customersQueryOptions({ per_page: 200 }));
  const { data: billersData } = useQuery(billersQueryOptions({ per_page: 100 }));
  const { data: currenciesData } = useQuery(currenciesQueryOptions({ per_page: 100 }));
  const { data: productsData } = useQuery(productsQueryOptions({ per_page: 200 }));

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const customerOptions = (customersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }));
  const billerOptions = [
    { value: NONE, label: 'None' },
    ...(billersData?.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))
  ];
  const currencyOptions = [
    { value: NONE, label: 'None' },
    ...(currenciesData?.data ?? []).map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))
  ];
  const productOptions = (productsData?.data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
    price: p.price
  }));

  const [items, setItems] = useState<SaleItemFormValues[]>(
    sale?.items?.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      qty: item.qty,
      net_unit_price: item.net_unit_price,
      discount: item.discount ?? 0,
      tax_rate: item.tax_rate ?? 0
    })) ?? []
  );
  const [payments, setPayments] = useState<SalePaymentInput[]>([]);

  const createMutation = useMutation({
    ...createSaleMutation,
    onSuccess: (created) => {
      toast.success('Sale created');
      onSuccess(created);
    },
    onError: () => toast.error("Couldn't create sale. Try again.")
  });

  const updateMutation = useMutation({
    ...updateSaleMutation,
    onSuccess: (updated) => {
      toast.success('Sale updated');
      onSuccess(updated);
    },
    onError: () => toast.error("Couldn't update sale. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      customer_id: sale?.customer_id ? String(sale.customer_id) : '',
      warehouse_id: sale?.warehouse_id ? String(sale.warehouse_id) : '',
      biller_id: sale?.biller_id ? String(sale.biller_id) : NONE,
      currency_id: sale?.currency_id ? String(sale.currency_id) : NONE,
      sale_status: sale?.sale_status ?? 'completed',
      order_tax_rate: sale?.order_tax_rate ?? 0,
      order_discount_type: sale?.order_discount_type ?? 'fixed',
      order_discount_value: sale?.order_discount_value ?? 0,
      shipping_cost: sale?.shipping_cost ?? 0,
      sale_note: sale?.sale_note ?? '',
      staff_note: sale?.staff_note ?? '',
      enable_installment: false,
      installment_name: '',
      installment_price: 0,
      installment_additional_amount: 0,
      installment_down_payment: 0,
      installment_months: 1
    },
    validators: {
      onSubmit: saleSchema
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
        currency_id: value.currency_id === NONE ? null : Number(value.currency_id),
        sale_status: value.sale_status as 'draft' | 'completed',
        order_tax_rate: value.order_tax_rate,
        order_discount_type: value.order_discount_type as 'fixed' | 'percentage',
        order_discount_value: value.order_discount_value,
        shipping_cost: value.shipping_cost,
        sale_note: value.sale_note || null,
        staff_note: value.staff_note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          qty: item.qty,
          net_unit_price: item.net_unit_price,
          discount: item.discount,
          tax_rate: item.tax_rate
        })),
        payments: payments.filter((p) => p.amount > 0),
        installment:
          !isEdit && value.enable_installment
            ? {
                name: value.installment_name,
                price: value.installment_price,
                additional_amount: value.installment_additional_amount,
                down_payment: value.installment_down_payment,
                months: value.installment_months
              }
            : null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: sale.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const subTotal = items.reduce((sum, row) => sum + rowTotal(row), 0);
  const enableInstallment = useStore(form.baseStore, (s) => s.values.enable_installment);

  return (
    <form
      className='space-y-6'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton loading={isPending} type='submit'>
          {isEdit ? 'Update Sale' : 'Create Sale'}
        </LoadingButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sale Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <form.AppField
              name='customer_id'
              children={(field) => <field.SelectField label='Customer' required options={customerOptions} />}
            />
            <form.AppField
              name='warehouse_id'
              children={(field) => <field.SelectField label='Warehouse' required options={warehouseOptions} />}
            />
            <form.AppField name='biller_id' children={(field) => <field.SelectField label='Biller' options={billerOptions} />} />
            <form.AppField
              name='currency_id'
              children={(field) => <field.SelectField label='Currency' options={currencyOptions} />}
            />
            <form.AppField
              name='sale_status'
              children={(field) => (
                <field.SelectField
                  label='Sale Status'
                  required
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                />
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <SaleItemsEditor items={items} onChange={setItems} productOptions={productOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Charges</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <form.AppField
              name='order_discount_type'
              children={(field) => (
                <field.SelectField
                  label='Discount Type'
                  options={[
                    { value: 'fixed', label: 'Fixed' },
                    { value: 'percentage', label: 'Percentage' }
                  ]}
                />
              )}
            />
            <form.AppField
              name='order_discount_value'
              children={(field) => <field.TextField label='Discount Value' type='number' />}
            />
            <form.AppField
              name='order_tax_rate'
              children={(field) => <field.TextField label='Order Tax %' type='number' />}
            />
            <form.AppField
              name='shipping_cost'
              children={(field) => <field.TextField label='Shipping Cost' type='number' />}
            />
          </FieldGroup>
          <p className='text-muted-foreground text-sm'>Items sub total: {subTotal.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <SalePaymentsEditor payments={payments} onChange={setPayments} accountOptions={[]} />
        </CardContent>
      </Card>

      {!isEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Installment Plan</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form.AppField
              name='enable_installment'
              children={(field) => <field.SwitchField label='Enable Installment Plan' />}
            />
            {enableInstallment && (
              <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <form.AppField
                  name='installment_name'
                  children={(field) => <field.TextField label='Plan Name' required />}
                />
                <form.AppField
                  name='installment_price'
                  children={(field) => <field.TextField label='Price' type='number' required />}
                />
                <form.AppField
                  name='installment_additional_amount'
                  children={(field) => <field.TextField label='Additional Amount' type='number' />}
                />
                <form.AppField
                  name='installment_down_payment'
                  children={(field) => <field.TextField label='Down Payment' type='number' />}
                />
                <form.AppField
                  name='installment_months'
                  children={(field) => <field.TextField label='Months' type='number' required />}
                />
              </FieldGroup>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.AppField name='sale_note' children={(field) => <field.TextareaField label='Sale Note' />} />
            <form.AppField name='staff_note' children={(field) => <field.TextareaField label='Staff Note' />} />
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
