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
import type { DamageStockItemFormValues } from '../schemas/damage-stock';

interface ProductOption {
  value: string;
  label: string;
  cost: number;
}

interface DamageStockItemsEditorProps {
  items: DamageStockItemFormValues[];
  onChange: (items: DamageStockItemFormValues[]) => void;
  productOptions: ProductOption[];
}

function emptyRow(): DamageStockItemFormValues {
  return { product_id: 0, qty: 1, unit_cost: 0 };
}

export function DamageStockItemsEditor({
  items,
  onChange,
  productOptions
}: DamageStockItemsEditorProps) {
  const updateRow = (index: number, patch: Partial<DamageStockItemFormValues>) => {
    onChange(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const totalQty = items.reduce((sum, row) => sum + row.qty, 0);

  return (
    <Field>
      <FieldLabel>Damaged Items *</FieldLabel>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[200px]'>Product</TableHead>
              <TableHead className='w-24'>Qty</TableHead>
              <TableHead className='w-28'>Unit Cost</TableHead>
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
                        unit_cost: row.unit_cost || selected?.cost || 0
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
                    value={row.unit_cost ?? 0}
                    onChange={(e) => updateRow(index, { unit_cost: Number(e.target.value) })}
                  />
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
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={() => onChange([...items, emptyRow()])}
        >
          <Icons.add className='mr-2 h-4 w-4' /> Add Item
        </Button>
        <p className='text-sm font-semibold'>Total Qty: {totalQty}</p>
      </div>
    </Field>
  );
}
