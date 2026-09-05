'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import type { QuotationItemFormValues } from '../schemas/quotation';

interface ProductOption {
  value: string;
  label: string;
  price: number;
}

interface QuotationItemsEditorProps {
  items: QuotationItemFormValues[];
  onChange: (items: QuotationItemFormValues[]) => void;
  productOptions: ProductOption[];
}

function emptyRow(): QuotationItemFormValues {
  return { product_id: 0, qty: 1, net_unit_price: 0, discount: 0, tax_rate: 0 };
}

export function rowTotal(row: QuotationItemFormValues): number {
  const subTotal = row.qty * row.net_unit_price - (row.discount ?? 0);
  const tax = subTotal * ((row.tax_rate ?? 0) / 100);
  return Math.max(0, subTotal + tax);
}

export function QuotationItemsEditor({ items, onChange, productOptions }: QuotationItemsEditorProps) {
  const updateRow = (index: number, patch: Partial<QuotationItemFormValues>) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, row) => sum + rowTotal(row), 0);

  return (
    <Field>
      <FieldLabel>Items *</FieldLabel>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[200px]'>Product</TableHead>
              <TableHead className='w-24'>Qty</TableHead>
              <TableHead className='w-28'>Unit Price</TableHead>
              <TableHead className='w-24'>Discount</TableHead>
              <TableHead className='w-24'>Tax %</TableHead>
              <TableHead className='w-28 text-right'>Total</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <select
                    className='border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm'
                    value={row.product_id || ''}
                    onChange={(e) => {
                      const selected = productOptions.find((o) => o.value === e.target.value);
                      updateRow(index, {
                        product_id: Number(e.target.value),
                        product_name: selected?.label,
                        net_unit_price: row.net_unit_price || selected?.price || 0
                      });
                    }}
                  >
                    <option value='' disabled>
                      Select product...
                    </option>
                    {productOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.0001'
                    value={row.qty}
                    onChange={(e) => updateRow(index, { qty: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={row.net_unit_price}
                    onChange={(e) => updateRow(index, { net_unit_price: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={row.discount ?? 0}
                    onChange={(e) => updateRow(index, { discount: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={row.tax_rate ?? 0}
                    onChange={(e) => updateRow(index, { tax_rate: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell className='text-right font-medium'>
                  {rowTotal(row).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeRow(index)}
                    aria-label='Remove row'
                  >
                    <Icons.trash className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <Button type='button' variant='secondary' size='sm' onClick={() => onChange([...items, emptyRow()])}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Item
        </Button>
        <p className='text-sm font-semibold'>Grand Total: {grandTotal.toFixed(2)}</p>
      </div>
    </Field>
  );
}
