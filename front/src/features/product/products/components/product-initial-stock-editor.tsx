'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import type { InitialStockRowValues } from '../schemas/product';

interface WarehouseOption {
  value: string;
  label: string;
}

interface ProductInitialStockEditorProps {
  rows: InitialStockRowValues[];
  onChange: (rows: InitialStockRowValues[]) => void;
  warehouseOptions: WarehouseOption[];
}

function emptyRow(): InitialStockRowValues {
  return { warehouse_id: 0, qty: 0 };
}

export function ProductInitialStockEditor({
  rows,
  onChange,
  warehouseOptions
}: ProductInitialStockEditorProps) {
  const updateRow = (index: number, patch: Partial<InitialStockRowValues>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <Field>
      <FieldLabel>Initial Stock</FieldLabel>
      <FieldDescription>
        Optional — sets opening stock per warehouse and records it as a purchase.
      </FieldDescription>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[200px]'>Warehouse</TableHead>
              <TableHead className='w-32'>Qty</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <select
                    className='border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm'
                    value={row.warehouse_id || ''}
                    onChange={(e) => {
                      const selected = warehouseOptions.find((o) => o.value === e.target.value);
                      updateRow(index, {
                        warehouse_id: Number(e.target.value),
                        warehouse_name: selected?.label
                      });
                    }}
                  >
                    <option value='' disabled>
                      Select warehouse...
                    </option>
                    {warehouseOptions.map((opt) => (
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
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => onChange(rows.filter((_, i) => i !== index))}
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
      <Button
        type='button'
        variant='secondary'
        size='sm'
        onClick={() => onChange([...rows, emptyRow()])}
      >
        <Icons.add className='mr-2 h-4 w-4' /> Add Warehouse Stock
      </Button>
    </Field>
  );
}
