'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useAppForm } from '@/lib/form';
import { salesQueryOptions } from '@/features/sales/sales/api/queries';
import { createSaleReturnMutation } from '../api/mutations';
import { availableReturnLinesQueryOptions } from '../api/queries';
import { returnSaleSchema } from '../schemas/return-sale';
import type { SaleReturn } from '../api/types';

interface ReturnFormProps {
  onSuccess: (saleReturn: SaleReturn) => void;
  onCancel: () => void;
}

export function ReturnForm({ onSuccess, onCancel }: ReturnFormProps) {
  const { data: salesData } = useQuery(salesQueryOptions({ per_page: 100, sale_status: 'completed' }));
  const saleOptions = (salesData?.data ?? []).map((s) => ({
    value: String(s.id),
    label: `${s.reference_no} — ${s.customer_name ?? ''}`
  }));

  const [selectedLines, setSelectedLines] = useState<Record<number, number>>({});

  const createMutation = useMutation({
    ...createSaleReturnMutation,
    onSuccess: (created) => {
      toast.success('Return created');
      onSuccess(created);
    },
    onError: () => toast.error("Couldn't create return. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      sale_id: '',
      refund: true,
      refund_amount: 0,
      paying_method: 'Cash',
      change_sale_status: false,
      return_note: '',
      staff_note: ''
    },
    validators: {
      onSubmit: returnSaleSchema
    },
    onSubmit: async ({ value }) => {
      const lines = Object.entries(selectedLines)
        .filter(([, qty]) => qty > 0)
        .map(([productSaleId, qty]) => ({ product_sale_id: Number(productSaleId), qty }));

      if (lines.length === 0) {
        toast.error('Select at least one line to return');
        return;
      }

      await createMutation.mutateAsync({
        sale_id: Number(value.sale_id),
        lines,
        refund: value.refund,
        refund_amount: value.refund ? value.refund_amount || null : null,
        paying_method: value.paying_method || 'Cash',
        change_sale_status: value.change_sale_status,
        return_note: value.return_note || undefined,
        staff_note: value.staff_note || undefined
      });
    }
  });

  const saleId = useStore(form.baseStore, (s) => Number(s.values.sale_id) || 0);

  useEffect(() => {
    setSelectedLines({});
  }, [saleId]);

  const { data: availableLines, isFetching: linesLoading } = useQuery(availableReturnLinesQueryOptions(saleId));

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
        <LoadingButton loading={createMutation.isPending} type='submit'>
          Create Return
        </LoadingButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sale</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.AppField
              name='sale_id'
              children={(field) => (
                <field.SelectField
                  label='Sale Reference'
                  required
                  options={saleOptions}
                />
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {saleId > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lines to Return</CardTitle>
          </CardHeader>
          <CardContent>
            {linesLoading ? (
              <p className='text-muted-foreground text-sm'>Loading lines…</p>
            ) : !availableLines || availableLines.length === 0 ? (
              <p className='text-muted-foreground text-sm'>Nothing left to return on this sale.</p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b text-left'>
                      <th className='p-2'></th>
                      <th className='p-2'>Product</th>
                      <th className='p-2'>Sold Qty</th>
                      <th className='p-2'>Already Returned</th>
                      <th className='p-2'>Returnable</th>
                      <th className='p-2'>Return Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableLines.map((line) => {
                      const checked = line.id in selectedLines;
                      return (
                        <tr key={line.id} className='border-b'>
                          <td className='p-2'>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                setSelectedLines((prev) => {
                                  const next = { ...prev };
                                  if (value === true) {
                                    next[line.id] = line.returnable_qty;
                                  } else {
                                    delete next[line.id];
                                  }
                                  return next;
                                })
                              }
                            />
                          </td>
                          <td className='p-2'>{line.product_name ?? line.product_id}</td>
                          <td className='p-2'>{line.qty}</td>
                          <td className='p-2'>{line.return_qty}</td>
                          <td className='p-2'>{line.returnable_qty}</td>
                          <td className='p-2'>
                            <Input
                              type='number'
                              min={0}
                              max={line.returnable_qty}
                              step='any'
                              disabled={!checked}
                              value={selectedLines[line.id] ?? 0}
                              onChange={(e) =>
                                setSelectedLines((prev) => ({
                                  ...prev,
                                  [line.id]: Math.min(Number(e.target.value) || 0, line.returnable_qty)
                                }))
                              }
                              className='w-24'
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Refund</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <form.AppField name='refund' children={(field) => <field.SwitchField label='Issue Refund' />} />
            <form.AppField
              name='refund_amount'
              children={(field) => <field.TextField label='Refund Amount' type='number' />}
            />
            <form.AppField name='paying_method' children={(field) => <field.TextField label='Paying Method' />} />
            <form.AppField
              name='change_sale_status'
              children={(field) => <field.SwitchField label='Mark Sale as Returned' />}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.AppField name='return_note' children={(field) => <field.TextareaField label='Return Note' />} />
            <form.AppField name='staff_note' children={(field) => <field.TextareaField label='Staff Note' />} />
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
