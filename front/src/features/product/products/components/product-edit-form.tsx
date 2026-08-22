'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productQueryOptions } from '../api/queries';
import { ProductForm } from './product-form';

export function ProductEditForm({ productId }: { productId: number }) {
  const router = useRouter();
  const { data: product, isPending } = useQuery(productQueryOptions(productId));

  if (isPending || !product) {
    return <div className='bg-muted h-96 w-full max-w-4xl animate-pulse rounded-lg' />;
  }

  return (
    <ProductForm
      product={product}
      onSuccess={() => router.push(`/dashboard/product/products/${productId}`)}
      onCancel={() => router.push(`/dashboard/product/products/${productId}`)}
    />
  );
}
