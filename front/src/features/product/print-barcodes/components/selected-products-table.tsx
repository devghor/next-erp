'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import type { PrintBarcodeProductRow } from '../api/types';

interface SelectedProductsTableProps {
  rows: PrintBarcodeProductRow[];
  onChange: (rows: PrintBarcodeProductRow[]) => void;
}

export function SelectedProductsTable({ rows, onChange }: SelectedProductsTableProps) {
  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm'>
        No products added yet. Search above to add products to print.
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className='w-28'>Price</TableHead>
            <TableHead className='w-28'>Qty</TableHead>
            <TableHead className='w-10' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.product_id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.code}</TableCell>
              <TableCell>{row.price.toFixed(2)}</TableCell>
              <TableCell>
                <Input
                  type='number'
                  min={1}
                  value={row.qty}
                  onChange={(e) =>
                    onChange(
                      rows.map((r, i) =>
                        i === index ? { ...r, qty: Math.max(1, Number(e.target.value)) } : r
                      )
                    )
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => onChange(rows.filter((_, i) => i !== index))}
                  aria-label='Remove product'
                >
                  <Icons.trash className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
