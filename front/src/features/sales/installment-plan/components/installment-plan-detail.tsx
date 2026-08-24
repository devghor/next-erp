'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { installmentPlanQueryOptions } from '../api/queries';
import type { Installment } from '../api/types';
import { PayInstallmentDialog } from './pay-installment-dialog';

interface InstallmentPlanDetailProps {
  planId: number;
}

export function InstallmentPlanDetail({ planId }: InstallmentPlanDetailProps) {
  const { data: plan, isPending } = useQuery(installmentPlanQueryOptions(planId));
  const [paying, setPaying] = useState<Installment | null>(null);

  if (isPending) {
    return <div className='bg-muted h-96 w-full animate-pulse rounded-lg' />;
  }

  if (!plan) {
    return <p className='text-muted-foreground text-sm'>Installment plan not found.</p>;
  }

  const salePaid = (plan.paid_count ?? 0) >= plan.months && plan.installments.every((i) => i.status === 'completed');

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6'>
            <div>
              <dt className='text-muted-foreground'>Sale Reference</dt>
              <dd>{plan.sale_reference_no ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Customer</dt>
              <dd>{plan.customer_name ?? '—'}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Price</dt>
              <dd>{plan.price.toFixed(2)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Additional</dt>
              <dd>{plan.additional_amount.toFixed(2)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Down Payment</dt>
              <dd>{plan.down_payment.toFixed(2)}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Total Amount</dt>
              <dd className='font-medium'>{plan.total_amount.toFixed(2)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Installments</CardTitle>
          {salePaid && <Badge>Sale Fully Paid</Badge>}
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b text-left'>
                  <th className='p-2'>#</th>
                  <th className='p-2'>Due Date</th>
                  <th className='p-2'>Status</th>
                  <th className='p-2'>Amount</th>
                  <th className='p-2'></th>
                </tr>
              </thead>
              <tbody>
                {plan.installments.map((installment, index) => (
                  <tr key={installment.id} className='border-b'>
                    <td className='p-2'>{index + 1}</td>
                    <td className='p-2'>{installment.payment_date}</td>
                    <td className='p-2'>
                      <Badge variant={installment.status === 'completed' ? 'default' : 'secondary'}>
                        {installment.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                    <td className='p-2'>{installment.amount.toFixed(2)}</td>
                    <td className='p-2 text-right'>
                      {installment.status === 'pending' && (
                        <Button size='sm' onClick={() => setPaying(installment)}>
                          Add Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {paying && (
        <PayInstallmentDialog installment={paying} open={!!paying} onOpenChange={(open) => !open && setPaying(null)} />
      )}
    </div>
  );
}
