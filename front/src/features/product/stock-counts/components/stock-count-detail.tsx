'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Can } from '@/components/can';
import { getQueryClient } from '@/lib/query-client';
import { stockCountQueryOptions, stockCountKeys } from '../api/queries';
import { submitStockCountMutation, adjustStockCountMutation } from '../api/mutations';
import type { StockCountStatus } from '../api/types';

const statusVariant: Record<StockCountStatus, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  counted: 'outline',
  adjusted: 'default'
};

interface StockCountDetailProps {
  id: number;
}

export function StockCountDetail({ id }: StockCountDetailProps) {
  const { data: stockCount, isPending } = useQuery(stockCountQueryOptions(id));
  const [countedQty, setCountedQty] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!stockCount?.items) return;
    setCountedQty(
      Object.fromEntries(
        stockCount.items.map((item) => [item.id, item.counted_qty ?? item.expected_qty])
      )
    );
  }, [stockCount?.items]);

  const submitMutation = useMutation({
    ...submitStockCountMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: stockCountKeys.detail(id) });
      toast.success('Counts saved');
    },
    onError: () => toast.error('Failed to save counts')
  });

  const adjustMutation = useMutation({
    ...adjustStockCountMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: stockCountKeys.detail(id) });
      toast.success('Stock adjusted');
    },
    onError: () => toast.error('Failed to adjust stock')
  });

  if (isPending || !stockCount) {
    return (
      <div className='flex flex-1 animate-pulse flex-col gap-4'>
        <div className='bg-muted h-10 w-full rounded' />
        <div className='bg-muted h-96 w-full rounded-lg' />
      </div>
    );
  }

  const isEditable = stockCount.status !== 'adjusted';

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3 rounded-lg border p-4'>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-xs'>Warehouse</p>
          <p className='font-medium'>{stockCount.warehouse_name}</p>
        </div>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-xs'>Type</p>
          <p className='font-medium capitalize'>{stockCount.type}</p>
        </div>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-xs'>Status</p>
          <Badge variant={statusVariant[stockCount.status]} className='capitalize'>
            {stockCount.status}
          </Badge>
        </div>
        <div className='space-y-1'>
          <p className='text-muted-foreground text-xs'>Counted By</p>
          <p className='font-medium'>{stockCount.user_name ?? 'N/A'}</p>
        </div>
        {stockCount.note && (
          <div className='space-y-1'>
            <p className='text-muted-foreground text-xs'>Note</p>
            <p className='font-medium'>{stockCount.note}</p>
          </div>
        )}
      </div>

      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className='w-28 text-right'>Expected Qty</TableHead>
              <TableHead className='w-32'>Counted Qty</TableHead>
              <TableHead className='w-28 text-right'>Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(stockCount.items ?? []).map((item) => {
              const currentCount = countedQty[item.id] ?? item.expected_qty;
              const difference = currentCount - Number(item.expected_qty);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.product_name}
                    {item.product_code && (
                      <span className='text-muted-foreground ml-1 text-xs'>
                        ({item.product_code})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>{item.expected_qty}</TableCell>
                  <TableCell>
                    <Input
                      type='number'
                      min={0}
                      step='0.0001'
                      value={currentCount}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setCountedQty((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                      }
                    />
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      difference > 0
                        ? 'text-green-600'
                        : difference < 0
                          ? 'text-destructive'
                          : ''
                    }`}
                  >
                    {difference > 0 ? '+' : ''}
                    {difference}
                  </TableCell>
                </TableRow>
              );
            })}
            {(stockCount.items ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='text-muted-foreground text-center'>
                  No products matched this stock count&apos;s filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isEditable && (
        <div className='flex justify-end gap-2'>
          <Can permission='UPDATE_PRODUCT_STOCK_COUNTS'>
            <LoadingButton
              variant='outline'
              loading={submitMutation.isPending}
              disabled={(stockCount.items ?? []).length === 0}
              onClick={() =>
                submitMutation.mutate({
                  id,
                  values: {
                    items: Object.entries(countedQty).map(([itemId, qty]) => ({
                      id: Number(itemId),
                      counted_qty: qty
                    }))
                  }
                })
              }
            >
              Save Counts
            </LoadingButton>
            <LoadingButton
              loading={adjustMutation.isPending}
              disabled={stockCount.status !== 'counted'}
              onClick={() => adjustMutation.mutate(id)}
            >
              Create Adjustment
            </LoadingButton>
          </Can>
        </div>
      )}

      {stockCount.status === 'adjusted' && (
        <p className='text-muted-foreground text-sm'>
          This stock count has been adjusted
          {stockCount.adjustment_id ? ` (Adjustment #${stockCount.adjustment_id})` : ''} and can
          no longer be edited.
        </p>
      )}
    </div>
  );
}
