'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Icons } from '@/components/icons';
import type { SalePaymentInput } from '../api/types';

const PAYING_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Cheque', 'Gift Card', 'Deposit', 'Points'];

interface AccountOption {
  value: string;
  label: string;
}

interface SalePaymentsEditorProps {
  payments: SalePaymentInput[];
  onChange: (payments: SalePaymentInput[]) => void;
  accountOptions: AccountOption[];
}

function emptyRow(): SalePaymentInput {
  return { paying_method: 'Cash', amount: 0 };
}

export function SalePaymentsEditor({ payments, onChange, accountOptions }: SalePaymentsEditorProps) {
  const updateRow = (index: number, patch: Partial<SalePaymentInput>) => {
    onChange(payments.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(payments.filter((_, i) => i !== index));
  };

  const totalPaid = payments.reduce((sum, row) => sum + (row.amount || 0), 0);

  return (
    <Field>
      <FieldLabel>Payments</FieldLabel>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[160px]'>Method</TableHead>
              <TableHead className='w-32'>Amount</TableHead>
              <TableHead className='min-w-[160px]'>Account</TableHead>
              <TableHead className='min-w-[140px]'>Cheque No.</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <select
                    className='border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm'
                    value={row.paying_method}
                    onChange={(e) => updateRow(index, { paying_method: e.target.value })}
                  >
                    {PAYING_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={row.amount}
                    onChange={(e) => updateRow(index, { amount: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <select
                    className='border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm'
                    value={row.account_id ?? ''}
                    onChange={(e) => updateRow(index, { account_id: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value=''>None</option>
                    {accountOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  {row.paying_method === 'Cheque' && (
                    <Input
                      value={row.cheque_no ?? ''}
                      onChange={(e) => updateRow(index, { cheque_no: e.target.value })}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button type='button' variant='ghost' size='icon' onClick={() => removeRow(index)} aria-label='Remove row'>
                    <Icons.trash className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <Button type='button' variant='secondary' size='sm' onClick={() => onChange([...payments, emptyRow()])}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Payment
        </Button>
        <p className='text-sm font-semibold'>Total Paid: {totalPaid.toFixed(2)}</p>
      </div>
    </Field>
  );
}
