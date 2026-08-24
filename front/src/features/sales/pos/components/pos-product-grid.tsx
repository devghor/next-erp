'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import type { Product } from '@/features/product/products/api/types';
import { formatMoney } from '../lib/money';

const ALL = 'all';

export interface PosProductGridProps {
  search: string;
  categoryId: string;
  brandId: string;
  warehouseId: number;
  perPage: number;
  currencyCode?: string | null;
  onSelectProduct: (product: Product) => void;
}

/**
 * Product grid with a "Load more" pager (`page` state accumulates onto the
 * previously-fetched rows). Resets to page 1 whenever a filter changes.
 */
export function PosProductGrid({
  search,
  categoryId,
  brandId,
  warehouseId,
  perPage,
  currencyCode,
  onSelectProduct
}: PosProductGridProps) {
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Product[]>([]);

  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [search, categoryId, brandId, warehouseId, perPage]);

  const { data, isLoading, isFetching } = useQuery(
    productsQueryOptions({
      name: search || undefined,
      category_id: categoryId === ALL ? undefined : categoryId,
      brand_id: brandId === ALL ? undefined : brandId,
      warehouse_id: warehouseId > 0 ? String(warehouseId) : undefined,
      stock_filter: 'all',
      page,
      per_page: perPage
    })
  );

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const hasMore = data ? data.meta.current_page < data.meta.last_page : false;

  if (isLoading && accumulated.length === 0) {
    return (
      <div className='grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className='h-40 w-full rounded-lg' />
        ))}
      </div>
    );
  }

  if (accumulated.length === 0) {
    return (
      <Empty className='h-full'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Icons.empty />
          </EmptyMedia>
          <EmptyTitle>No products found</EmptyTitle>
          <EmptyDescription>Try a different search term, category, or brand.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className='space-y-3 p-3'>
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5', isFetching && 'opacity-60')}>
        {accumulated.map((product) => {
          const outOfStock = product.stock <= 0;
          return (
            <Card
              key={`${product.id}`}
              role='button'
              tabIndex={0}
              onClick={() => onSelectProduct(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProduct(product);
                }
              }}
              className='hover:border-primary focus-visible:ring-ring flex cursor-pointer flex-col gap-2 overflow-hidden p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none'
            >
              <div className='bg-muted relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md'>
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className='h-full w-full object-cover' />
                ) : (
                  <Icons.product className='text-muted-foreground h-10 w-10' />
                )}
                {outOfStock && (
                  <Badge variant='destructive' className='absolute top-1 right-1'>
                    Out of stock
                  </Badge>
                )}
              </div>
              <div className='min-w-0 space-y-0.5 px-1 pb-1'>
                <p className='truncate text-sm font-medium' title={product.name}>
                  {product.name}
                </p>
                <p className='text-muted-foreground truncate text-xs'>{product.code}</p>
                <div className='flex items-center justify-between pt-1'>
                  <span className='text-sm font-semibold'>{formatMoney(product.price, { currencyCode })}</span>
                  <span className='text-muted-foreground text-xs'>Qty {product.stock}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div className='flex justify-center pb-2'>
          <Button type='button' variant='outline' size='sm' onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
            {isFetching ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
