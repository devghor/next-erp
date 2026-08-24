'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Icons } from '@/components/icons';
import { salesQueryOptions } from '@/features/sales/sales/api/queries';
import type { Sale } from '@/features/sales/sales/api/types';
import { formatMoney } from '../lib/money';

export interface PosHeldSalesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: number;
  currencyCode?: string | null;
  onResumeDraft: (sale: Sale) => void;
  onReprint: (saleId: number) => void;
}

function SaleRow({
  sale,
  currencyCode,
  actionLabel,
  onAction
}: {
  sale: Sale;
  currencyCode?: string | null;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className='flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0'>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium'>{sale.reference_no}</p>
        <p className='text-muted-foreground truncate text-xs'>
          {sale.customer_name ?? 'Walk-in'} · {new Date(sale.created_at).toLocaleString()}
        </p>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <Badge variant='outline'>{formatMoney(sale.grand_total, { currencyCode })}</Badge>
        <Button type='button' size='sm' variant='secondary' onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

/** Recent (sale_status=completed) / Draft (sale_status=draft) tabs — reuses salesQueryOptions, no new endpoint. */
export function PosHeldSalesDrawer({
  open,
  onOpenChange,
  warehouseId,
  currencyCode,
  onResumeDraft,
  onReprint
}: PosHeldSalesDrawerProps) {
  const [tab, setTab] = useState<'recent' | 'draft'>('draft');

  const warehouseFilter = warehouseId > 0 ? String(warehouseId) : undefined;

  const recentQuery = useQuery({
    ...salesQueryOptions({ sale_status: 'completed', warehouse_id: warehouseFilter, per_page: 25 }),
    enabled: open && tab === 'recent'
  });

  const draftQuery = useQuery({
    ...salesQueryOptions({ sale_status: 'draft', warehouse_id: warehouseFilter, per_page: 50 }),
    enabled: open && tab === 'draft'
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection='right'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Held Sales</DrawerTitle>
          <DrawerDescription>Resume a draft sale or reprint a recent receipt.</DrawerDescription>
        </DrawerHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'recent' | 'draft')} className='flex-1 px-4'>
          <TabsList className='w-full'>
            <TabsTrigger value='draft' className='flex-1'>
              Draft
            </TabsTrigger>
            <TabsTrigger value='recent' className='flex-1'>
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value='draft' className='mt-2'>
            {(draftQuery.data?.data.length ?? 0) === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <Icons.hold />
                  </EmptyMedia>
                  <EmptyTitle>No held sales</EmptyTitle>
                  <EmptyDescription>Sales you hold at this warehouse show up here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ScrollArea className='h-[calc(100dvh-220px)]'>
                {draftQuery.data?.data.map((sale) => (
                  <SaleRow key={sale.id} sale={sale} currencyCode={currencyCode} actionLabel='Resume' onAction={() => onResumeDraft(sale)} />
                ))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value='recent' className='mt-2'>
            {(recentQuery.data?.data.length ?? 0) === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <Icons.history />
                  </EmptyMedia>
                  <EmptyTitle>No recent sales</EmptyTitle>
                  <EmptyDescription>Completed POS sales at this warehouse show up here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ScrollArea className='h-[calc(100dvh-220px)]'>
                {recentQuery.data?.data.map((sale) => (
                  <SaleRow
                    key={sale.id}
                    sale={sale}
                    currencyCode={currencyCode}
                    actionLabel='Reprint'
                    onAction={() => onReprint(sale.id)}
                  />
                ))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
