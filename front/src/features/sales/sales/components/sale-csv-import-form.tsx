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
import { customersQueryOptions } from '@/features/people/customers/api/queries';
import { billersQueryOptions } from '@/features/people/billers/api/queries';
import { importSaleCsvMutation } from '../api/mutations';

const NONE = 'none';

export function SaleCsvImportForm() {
  const router = useRouter();

  const { data: warehousesData } = useQuery(warehousesQueryOptions({ per_page: 100 }));
  const { data: customersData } = useQuery(customersQueryOptions({ per_page: 200 }));
  const { data: billersData } = useQuery(billersQueryOptions({ per_page: 100 }));

  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [billerId, setBillerId] = useState(NONE);
  const [saleStatus, setSaleStatus] = useState<'draft' | 'completed'>('completed');
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    ...importSaleCsvMutation,
    onSuccess: (sale) => {
      toast.success(`Imported sale ${sale.reference_no}`);
      router.push(`/dashboard/sales/${sale.id}/edit`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Import failed')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Choose a CSV file');
      return;
    }
    if (!customerId || !warehouseId) {
      toast.error('Customer and warehouse are required');
      return;
    }

    importMutation.mutate({
      file,
      customer_id: Number(customerId),
      warehouse_id: Number(warehouseId),
      biller_id: billerId === NONE ? null : Number(billerId),
      sale_status: saleStatus
    });
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Import Sale from CSV</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            CSV columns, no header row: product code, qty, unit code (or &quot;n/a&quot;), price, discount, tax name (or
            &quot;No Tax&quot;).
          </p>

          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='customer_id'>Customer *</FieldLabel>
              <select
                id='customer_id'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value='' disabled>
                  Select customer...
                </option>
                {(customersData?.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

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
              <FieldLabel htmlFor='biller_id'>Biller</FieldLabel>
              <select
                id='biller_id'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={billerId}
                onChange={(e) => setBillerId(e.target.value)}
              >
                <option value={NONE}>None</option>
                {(billersData?.data ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor='sale_status'>Sale Status</FieldLabel>
              <select
                id='sale_status'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={saleStatus}
                onChange={(e) => setSaleStatus(e.target.value as 'draft' | 'completed')}
              >
                <option value='completed'>Completed</option>
                <option value='draft'>Draft</option>
              </select>
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
        </CardContent>
      </Card>

      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => router.push('/dashboard/sales')}>
          Cancel
        </Button>
        <LoadingButton loading={importMutation.isPending} type='submit'>
          Import
        </LoadingButton>
      </div>
    </form>
  );
}
