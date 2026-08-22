'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from './product-form';

export function ProductCreateForm() {
  const router = useRouter();

  return (
    <ProductForm
      onSuccess={() => router.push('/dashboard/product/products')}
      onCancel={() => router.push('/dashboard/product/products')}
    />
  );
}
