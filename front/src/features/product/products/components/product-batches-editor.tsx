'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Icons } from '@/components/icons';
import type { BatchRowValues } from '../schemas/product';

interface ProductBatchesEditorProps {
  rows: BatchRowValues[];
  onChange: (rows: BatchRowValues[]) => void;
}

function emptyRow(): BatchRowValues {
  return { batch_no: '', expired_date: '' };
}

export function ProductBatchesEditor({ rows, onChange }: ProductBatchesEditorProps) {
  const updateRow = (index: number, patch: Partial<BatchRowValues>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <Field>
      <FieldLabel>Batches *</FieldLabel>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='min-w-[160px]'>Batch No</TableHead>
              <TableHead className='min-w-[160px]'>Expiry Date</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={row.batch_no}
                    placeholder='B-2026-001'
                    onChange={(e) => updateRow(index, { batch_no: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='date'
                    value={row.expired_date ?? ''}
                    onChange={(e) => updateRow(index, { expired_date: e.target.value })}
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
        <Icons.add className='mr-2 h-4 w-4' /> Add Batch
      </Button>
    </Field>
  );
}
