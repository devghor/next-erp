'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Icons } from '@/components/icons';
import type { VariantRowValues } from '../schemas/product';

interface ProductVariantsEditorProps {
  rows: VariantRowValues[];
  onChange: (rows: VariantRowValues[]) => void;
}

function emptyRow(): VariantRowValues {
  return { name: '', item_code: '', additional_cost: 0, additional_price: 0 };
}

export function ProductVariantsEditor({ rows, onChange }: ProductVariantsEditorProps) {
  const updateRow = (index: number, patch: Partial<VariantRowValues>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <Field>
      <FieldLabel>Variants *</FieldLabel>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[140px]'>Variant Name</TableHead>
              <TableHead className='min-w-[140px]'>Item Code</TableHead>
              <TableHead className='w-32'>Additional Cost</TableHead>
              <TableHead className='w-32'>Additional Price</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={row.name}
                    placeholder='Red / Large'
                    onChange={(e) => updateRow(index, { name: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.item_code}
                    placeholder='SKU-RED-L'
                    onChange={(e) => updateRow(index, { item_code: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={row.additional_cost}
                    onChange={(e) => updateRow(index, { additional_cost: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={row.additional_price}
                    onChange={(e) => updateRow(index, { additional_price: Number(e.target.value) })}
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
      <Button type='button' variant='secondary' size='sm' onClick={() => onChange([...rows, emptyRow()])}>
        <Icons.add className='mr-2 h-4 w-4' /> Add Variant
      </Button>
    </Field>
  );
}
