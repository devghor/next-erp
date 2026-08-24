'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAppForm } from '@/lib/form';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { customersQueryOptions } from '@/features/people/customers/api/queries';
import { billersQueryOptions } from '@/features/people/billers/api/queries';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import { findSaleByReference } from '../api/service';
import { createSaleExchangeMutation } from '../api/mutations';
import { exchangeSchema } from '../schemas/exchange';
import type { ExchangeLineFormValues } from '../schemas/exchange';
import type { SaleExchange } from '../api/types';
import type { Sale } from '@/features/sales/sales/api/types';
import { ExchangeLinesEditor, rowTotal } from './exchange-lines-editor';

const NONE = 'none';

interface ExchangeFormProps {
  onSuccess: (exchange: SaleExchange) => void;
  onCancel: () => void;
}

export function ExchangeForm({ onSuccess, onCancel }: ExchangeFormProps) {
  const { data: warehousesData } = useQuery(warehousesQueryOptions({ per_page: 100 }));
  const { data: customersData } = useQuery(customersQueryOptions({ per_page: 200 }));
  const { data: billersData } = useQuery(billersQueryOptions({ per_page: 100 }));
  const { data: productsData } = useQuery(productsQueryOptions({ per_page: 200 }));

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const customerOptions = (customersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }));
  const billerOptions = [
    { value: NONE, label: 'None' },
    ...(billersData?.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))
  ];
  const productOptions = (productsData?.data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
    price: p.price
  }));

  const [linkedSale, setLinkedSale] = useState<Sale | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [newLines, setNewLines] = useState<ExchangeLineFormValues[]>([]);
  const [returnedLines, setReturnedLines] = useState<ExchangeLineFormValues[]>([]);

  const createMutation = useMutation({
    ...createSaleExchangeMutation,
    onSuccess: (created) => {
      toast.success('Exchange created');
      onSuccess(created);
    },
    onError: () => toast.error("Couldn't create exchange. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      sale_reference_no: '',
      customer_id: '',
      warehouse_id: '',
      biller_id: NONE,
      payment_type: NONE,
      amount: 0,
      exchange_note: '',
      staff_note: ''
    },
    validators: {
      onSubmit: exchangeSchema
    },
    onSubmit: async ({ value }) => {
      const lines = [...newLines, ...returnedLines];
      if (lines.length === 0) {
        toast.error('Add at least one product (new or returned)');
        return;
      }
      if (lines.some((line) => !line.product_id || line.qty <= 0)) {
        toast.error('Every line needs a product and a qty greater than 0');
        return;
      }

      const payload = {
        sale_id: linkedSale?.id ?? null,
        customer_id: Number(value.customer_id),
        warehouse_id: Number(value.warehouse_id),
        biller_id: value.biller_id === NONE ? null : Number(value.biller_id),
        payment_type: value.payment_type === NONE ? null : (value.payment_type as 'pay' | 'receive'),
        amount: value.amount,
        exchange_note: value.exchange_note || null,
        staff_note: value.staff_note || null,
        lines: lines.map((line) => ({
          type: line.type,
          product_id: line.product_id,
          variant_id: line.variant_id ?? null,
          batch_id: line.batch_id ?? null,
          product_sale_id: line.product_sale_id ?? null,
          qty: line.qty,
          net_unit_price: line.net_unit_price,
          discount: line.discount,
          tax_rate: line.tax_rate
        }))
      };

      await createMutation.mutateAsync(payload);
    }
  });

  const lookupSale = async () => {
    const referenceNo = form.getFieldValue('sale_reference_no');
    if (!referenceNo) return;

    setLookupError(null);
    try {
      const sale = await findSaleByReference(referenceNo);
      setLinkedSale(sale);
      form.setFieldValue('customer_id', String(sale.customer_id));
      form.setFieldValue('warehouse_id', String(sale.warehouse_id));
      if (sale.biller_id) form.setFieldValue('biller_id', String(sale.biller_id));
    } catch {
      setLinkedSale(null);
      setLookupError('No sale found with that reference number');
    }
  };

  const addSaleLineAsReturn = (itemId: number) => {
    const item = linkedSale?.items?.find((i) => i.id === itemId);
    if (!item) return;

    setReturnedLines((prev) => [
      ...prev,
      {
        type: 'returned',
        product_id: item.product_id,
        product_name: item.product_name,
        product_sale_id: item.id ?? null,
        variant_id: item.variant_id ?? null,
        batch_id: item.batch_id ?? null,
        qty: item.qty,
        net_unit_price: item.net_unit_price,
        discount: item.discount ?? 0,
        tax_rate: item.tax_rate ?? 0
      }
    ]);
  };

  const isPending = createMutation.isPending;
  const newTotal = newLines.reduce((sum, row) => sum + rowTotal(row), 0);
  const returnedTotal = returnedLines.reduce((sum, row) => sum + rowTotal(row), 0);
  const netAmount = newTotal - returnedTotal;

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
          Create Exchange
        </LoadingButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linked Sale (optional)</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <form.AppField
              name='sale_reference_no'
              children={(field) => <field.TextField label='Sale Reference No' placeholder='SR-...' />}
            />
            <div className='flex items-end'>
              <Button type='button' variant='secondary' onClick={lookupSale}>
                Look up sale
              </Button>
            </div>
          </FieldGroup>
          {lookupError && <p className='text-destructive text-sm'>{lookupError}</p>}
          {linkedSale && (
            <div className='bg-muted/40 rounded-md border p-3 text-sm'>
              <p>
                Linked to <strong>{linkedSale.reference_no}</strong> — Grand Total: {Number(linkedSale.grand_total).toFixed(2)}, Paid:{' '}
                {Number(linkedSale.paid_amount).toFixed(2)}
              </p>
              {(linkedSale.items?.length ?? 0) > 0 && (
                <div className='mt-2 flex flex-wrap gap-2'>
                  {linkedSale.items?.map((item) => (
                    <Button key={item.id} type='button' size='sm' variant='outline' onClick={() => addSaleLineAsReturn(item.id!)}>
                      + Return {item.product_name ?? `#${item.product_id}`}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exchange Details</CardTitle>
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products Returned</CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeLinesEditor
            type='returned'
            label='Returned Products'
            lines={returnedLines}
            onChange={setReturnedLines}
            productOptions={productOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeLinesEditor type='new' label='New Products' lines={newLines} onChange={setNewLines} productOptions={productOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settlement</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            New total: {newTotal.toFixed(2)} — Returned total: {returnedTotal.toFixed(2)} — Net: {netAmount.toFixed(2)}
          </p>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <form.AppField
              name='payment_type'
              children={(field) => (
                <field.SelectField
                  label='Settlement Type'
                  options={[
                    { value: NONE, label: 'None' },
                    { value: 'receive', label: 'Receive (customer pays difference)' },
                    { value: 'pay', label: 'Pay (refund customer)' }
                  ]}
                />
              )}
            />
            <form.AppField name='amount' children={(field) => <field.TextField label='Settlement Amount' type='number' />} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.AppField name='exchange_note' children={(field) => <field.TextareaField label='Exchange Note' />} />
            <form.AppField name='staff_note' children={(field) => <field.TextareaField label='Staff Note' />} />
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
