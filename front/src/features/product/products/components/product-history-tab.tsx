'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productHistoryQueryOptions } from '../api/queries';

export function ProductHistoryTab({ productId }: { productId: number }) {
  const { data, isPending } = useQuery(productHistoryQueryOptions(productId));

  if (isPending) {
    return <div className='bg-muted h-64 w-full animate-pulse rounded-lg' />;
  }

  if (!data) return null;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Total Stock</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-semibold'>{data.total_stock}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Average Cost</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-semibold'>
            {data.average_cost.toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Stock by Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.stock_by_warehouse.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.warehouse ?? 'N/A'}</TableCell>
                  <TableCell className='text-right'>{row.qty}</TableCell>
                </TableRow>
              ))}
              {data.stock_by_warehouse.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className='text-muted-foreground text-center'>
                    No stock recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
                <TableHead className='text-right'>Unit Cost</TableHead>
                <TableHead className='text-right'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.purchase_history.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.reference_no}</TableCell>
                  <TableCell>{row.warehouse}</TableCell>
                  <TableCell>{row.supplier}</TableCell>
                  <TableCell className='text-right'>{row.qty}</TableCell>
                  <TableCell className='text-right'>{row.net_unit_cost.toFixed(2)}</TableCell>
                  <TableCell className='text-right'>{row.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {data.purchase_history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground text-center'>
                    No purchase history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className='text-right'>Qty</TableHead>
                <TableHead className='text-right'>Unit Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.adjustment_history.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.reference_no}</TableCell>
                  <TableCell>{row.warehouse}</TableCell>
                  <TableCell>{row.action === '+' ? 'Add' : 'Remove'}</TableCell>
                  <TableCell className='text-right'>{row.qty}</TableCell>
                  <TableCell className='text-right'>
                    {row.unit_cost !== null ? row.unit_cost.toFixed(2) : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {data.adjustment_history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground text-center'>
                    No adjustment history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
