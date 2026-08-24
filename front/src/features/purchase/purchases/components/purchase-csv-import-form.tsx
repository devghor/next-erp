'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { suppliersQueryOptions } from '@/features/people/suppliers/api/queries';
import { importPurchaseCsvMutation } from '../api/mutations';

const NONE = 'none';

const SAMPLE_CSV = `product_code,qty,unit_code,cost,discount_per_unit,tax_name
P001,10,pc,100,5,VAT 10
P002,5,box,50,0,No Tax`;

export function PurchaseCsvImportForm() {
  const router = useRouter();

  const { data: warehousesData } = useQuery(warehousesQueryOptions({ per_page: 100 }));
  const { data: suppliersData } = useQuery(suppliersQueryOptions({ per_page: 200 }));

  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState(NONE);
  const [status, setStatus] = useState<'pending' | 'received'>('received');
  const [orderTax, setOrderTax] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [payingMethod, setPayingMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    ...importPurchaseCsvMutation,
    onSuccess: (purchase) => {
      toast.success(`Imported purchase ${purchase.reference_no}`);
      router.push('/dashboard/purchase/purchases');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Import failed')
  });

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_purchase_products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Choose a CSV file');
      return;
    }
    if (!warehouseId) {
      toast.error('Warehouse is required');
      return;
    }

    importMutation.mutate({
      file,
      warehouse_id: Number(warehouseId),
      supplier_id: supplierId === NONE ? null : Number(supplierId),
      status,
      order_tax: Number(orderTax),
      paid_amount: Number(paidAmount),
      paying_method: payingMethod,
      note: note || null
    });
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Import Purchase from CSV</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            CSV columns, no header row: product code, qty, unit code (or &quot;n/a&quot;), cost,
            discount per unit, tax name (or &quot;No Tax&quot;).
          </p>

          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='warehouse_id'>Warehouse *</FieldLabel>
              <select
                id='warehouse_id'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                <option value='' disabled>
                  Select warehouse...
                </option>
                {(warehousesData?.data ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor='supplier_id'>Supplier</FieldLabel>
              <select
                id='supplier_id'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value={NONE}>None</option>
                {(suppliersData?.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor='status'>Status</FieldLabel>
              <select
                id='status'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'received')}
              >
                <option value='received'>Received</option>
                <option value='pending'>Pending</option>
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor='order_tax'>Order Tax</FieldLabel>
              <input
                id='order_tax'
                type='number'
                min={0}
                step='any'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={orderTax}
                onChange={(e) => setOrderTax(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='paid_amount'>Paid Amount</FieldLabel>
              <input
                id='paid_amount'
                type='number'
                min={0}
                step='any'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor='paying_method'>Paying Method</FieldLabel>
              <input
                id='paying_method'
                type='text'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={payingMethod}
                onChange={(e) => setPayingMethod(e.target.value)}
              />
            </Field>

            <Field className='sm:col-span-2'>
              <FieldLabel htmlFor='note'>Note</FieldLabel>
              <textarea
                id='note'
                rows={3}
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor='file'>CSV File *</FieldLabel>
            <input
              id='file'
              type='file'
              accept='.csv,text/csv'
              className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Field>

          <Button type='button' variant='outline' onClick={downloadSample}>
            Download Sample File
          </Button>
        </CardContent>
      </Card>

      <div className='flex items-center justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/purchase/purchases')}
        >
          Cancel
        </Button>
        <LoadingButton loading={importMutation.isPending} type='submit'>
          Import
        </LoadingButton>
      </div>
    </form>
  );
}
