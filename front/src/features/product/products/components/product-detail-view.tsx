'use client';

import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { Can } from '@/components/can';
import { productQueryOptions } from '../api/queries';
import { printProductBarcode } from '../api/service';
import { ProductHistoryTab } from './product-history-tab';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProductDetailView({ productId }: { productId: number }) {
  const { data: product, isPending } = useQuery(productQueryOptions(productId));

  const barcodeMutation = useMutation({
    mutationFn: () => printProductBarcode(productId, 1),
    onSuccess: (blob) => downloadBlob(blob, `barcode-${product?.code}.pdf`),
    onError: () => toast.error('Failed to generate barcode')
  });

  if (isPending || !product) {
    return <div className='bg-muted h-64 w-full animate-pulse rounded-lg' />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h2 className='text-xl font-semibold'>{product.name}</h2>
            <p className='text-muted-foreground text-sm'>
              {product.code} <Badge variant='secondary' className='ml-2 capitalize'>{product.type}</Badge>
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <LoadingButton variant='outline' onClick={() => barcodeMutation.mutate()} loading={barcodeMutation.isPending}>
            <Icons.download className='mr-2 h-4 w-4' /> Print Barcode
          </LoadingButton>
          <Can permission='UPDATE_PRODUCT_PRODUCTS'>
            <Button render={<Link href={`/dashboard/product/products/${product.id}/edit`} aria-label='Edit' />}>
              <Icons.edit className='mr-2 h-4 w-4' /> Edit
            </Button>
          </Can>
        </div>
      </div>

      <Tabs defaultValue='details'>
        <TabsList>
          <TabsTrigger value='details'>Details</TabsTrigger>
          <TabsTrigger value='history'>Purchase History</TabsTrigger>
        </TabsList>
        <TabsContent value='details' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <DetailField label='Category' value={product.category_name} />
            <DetailField label='Brand' value={product.brand_name} />
            <DetailField label='Unit' value={product.unit_name} />
            <DetailField label='Cost' value={product.cost.toFixed(2)} />
            <DetailField label='Price' value={product.price.toFixed(2)} />
            <DetailField label='Tax' value={product.tax_name} />
            <DetailField label='Current Stock' value={String(product.stock)} />
            <DetailField label='Average Cost' value={product.average_cost.toFixed(2)} />
            <DetailField label='Alert Quantity' value={String(product.alert_quantity)} />
          </div>
          {product.images.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {product.images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={product.name} className='h-24 w-24 rounded object-cover' />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value='history'>
          <ProductHistoryTab productId={product.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='text-sm font-medium'>{value || 'N/A'}</p>
    </div>
  );
}
