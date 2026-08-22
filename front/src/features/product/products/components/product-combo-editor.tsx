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
import type { ComboRowValues } from '../schemas/product';

interface ComponentOption {
  value: string;
  label: string;
}

interface ProductComboEditorProps {
  rows: ComboRowValues[];
  onChange: (rows: ComboRowValues[]) => void;
  componentOptions: ComponentOption[];
}

function emptyRow(): ComboRowValues {
  return { component_product_id: 0, qty: 1, unit_price: 0, wastage_percent: 0 };
}

export function ProductComboEditor({ rows, onChange, componentOptions }: ProductComboEditorProps) {
  const updateRow = (index: number, patch: Partial<ComboRowValues>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <Field>
      <FieldLabel>Combo Items *</FieldLabel>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[200px]'>Component Product</TableHead>
              <TableHead className='w-24'>Qty</TableHead>
              <TableHead className='w-28'>Unit Price</TableHead>
              <TableHead className='w-28'>Wastage %</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <select
                    className='border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm'
                    value={row.component_product_id || ''}
                    onChange={(e) => {
                      const selected = componentOptions.find((o) => o.value === e.target.value);
                      updateRow(index, {
                        component_product_id: Number(e.target.value),
                        component_product_name: selected?.label
                      });
                    }}
                  >
                    <option value='' disabled>
                      Select product...
                    </option>
                    {componentOptions.map((opt) => (
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
                    value={row.unit_price}
                    onChange={(e) => updateRow(index, { unit_price: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    max={100}
                    step='0.01'
                    value={row.wastage_percent}
                    onChange={(e) => updateRow(index, { wastage_percent: Number(e.target.value) })}
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
        <Icons.add className='mr-2 h-4 w-4' /> Add Component
      </Button>
    </Field>
  );
}
