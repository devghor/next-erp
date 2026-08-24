'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { challanQueryOptions } from '../api/queries';
import { finalizeChallanMutation } from '../api/mutations';
import type { ChallanPackingSlip } from '../api/types';

interface ChallanDetailProps {
  challanId: number;
}

type RowState = { status: 'pending' | 'delivered' | 'cancelled'; paid_amount: number; delivery_charge: number };

export function ChallanDetail({ challanId }: ChallanDetailProps) {
  const { data: challan, isPending } = useQuery(challanQueryOptions(challanId));
  const [rows, setRows] = useState<Record<number, RowState>>({});

  useEffect(() => {
    if (!challan) return;
    setRows((prev) => {
      const next = { ...prev };
      for (const slip of challan.packing_slips) {
        if (!(slip.id in next)) {
          next[slip.id] = {
            status: slip.status === 'pending' ? 'pending' : slip.status,
            paid_amount: slip.status === 'pending' ? (slip.sale_due ?? slip.amount) : 0,
            delivery_charge: slip.delivery_charge
          };
        }
      }
      return next;
    });
  }, [challan]);

  const finalizeMutation = useMutation({
    ...finalizeChallanMutation,
    onSuccess: () => toast.success('Challan updated'),
    onError: () => toast.error("Couldn't record the update. Try again.")
  });

  if (isPending) {
    return <div className='bg-muted h-96 w-full animate-pulse rounded-lg' />;
  }

  if (!challan) {
    return <p className='text-muted-foreground text-sm'>Challan not found.</p>;
  }

  const isClosed = challan.status === 'close';

  function updateRow(id: number, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function handleSubmit() {
    if (!challan) return;
    const payments = Object.entries(rows)
      .filter(([, row]) => row.status !== 'pending')
      .map(([id, row]) => ({
        challan_packing_slip_id: Number(id),
        status: row.status as 'delivered' | 'cancelled',
        paid_amount: row.paid_amount,
        delivery_charge: row.delivery_charge
      }));

    if (payments.length === 0) {
      toast.error('Mark at least one packing slip as delivered or cancelled');
      return;
    }

    finalizeMutation.mutate({ id: challan.id, data: { payments } });
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>{challan.reference_no}</CardTitle>
          <Badge variant={challan.status === 'active' ? 'default' : 'secondary'}>
            {challan.status === 'active' ? 'Active' : 'Closed'}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className='grid grid-cols-2 gap-4 text-sm sm:grid-cols-4'>
            <div>
              <dt className='text-muted-foreground'>Courier</dt>
              <dd>{challan.courier_name ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Total Amount</dt>
              <dd>{challan.total_amount.toFixed(2)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Total Due</dt>
              <dd>{challan.total_due.toFixed(2)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Closing Date</dt>
              <dd>{challan.closing_date ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Packing Slips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b text-left'>
                  <th className='p-2'>Packing Slip</th>
                  <th className='p-2'>Sale</th>
                  <th className='p-2'>Customer</th>
                  <th className='p-2'>Due</th>
                  <th className='p-2'>Status</th>
                  <th className='p-2'>Collect Amount</th>
                  <th className='p-2'>Delivery Charge</th>
                </tr>
              </thead>
              <tbody>
                {challan.packing_slips.map((slip: ChallanPackingSlip) => {
                  const row = rows[slip.id] ?? { status: 'pending', paid_amount: 0, delivery_charge: 0 };
                  const editable = !isClosed && slip.status === 'pending';
                  return (
                    <tr key={slip.id} className='border-b'>
                      <td className='p-2'>{slip.packing_slip_reference_no}</td>
                      <td className='p-2'>{slip.sale_reference_no ?? '—'}</td>
                      <td className='p-2'>{slip.customer_name ?? '—'}</td>
                      <td className='p-2'>{(slip.sale_due ?? 0).toFixed(2)}</td>
                      <td className='p-2'>
                        {editable ? (
                          <Select
                            value={row.status}
                            onValueChange={(v) => v && updateRow(slip.id, { status: v as RowState['status'] })}
                          >
                            <SelectTrigger className='w-32'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='pending'>Pending</SelectItem>
                              <SelectItem value='delivered'>Delivered</SelectItem>
                              <SelectItem value='cancelled'>Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={slip.status === 'delivered' ? 'default' : 'secondary'}>{slip.status}</Badge>
                        )}
                      </td>
                      <td className='p-2'>
                        {editable ? (
                          <Input
                            type='number'
                            min={0}
                            step='any'
                            className='w-28'
                            disabled={row.status !== 'delivered'}
                            value={row.paid_amount}
                            onChange={(e) => updateRow(slip.id, { paid_amount: Number(e.target.value) || 0 })}
                          />
                        ) : (
                          slip.paid_amount.toFixed(2)
                        )}
                      </td>
                      <td className='p-2'>
                        {editable ? (
                          <Input
                            type='number'
                            min={0}
                            step='any'
                            className='w-28'
                            value={row.delivery_charge}
                            onChange={(e) => updateRow(slip.id, { delivery_charge: Number(e.target.value) || 0 })}
                          />
                        ) : (
                          slip.delivery_charge.toFixed(2)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!isClosed && (
        <div className='flex justify-end'>
          <LoadingButton loading={finalizeMutation.isPending} onClick={handleSubmit}>
            Save & Reconcile
          </LoadingButton>
        </div>
      )}
    </div>
  );
}
