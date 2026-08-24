'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import type { Product } from '@/features/product/products/api/types';
import type { AddCartLineInput } from '../hooks/use-pos-cart';

export interface PosVariantPickerDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: AddCartLineInput) => void;
}

/** Shown before add-to-cart for a product with variants and/or batches, so the cashier picks which one before it lands in the cart line. */
export function PosVariantPickerDialog({ product, open, onOpenChange, onConfirm }: PosVariantPickerDialogProps) {
  const [variantId, setVariantId] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    setVariantId(product.variants?.[0]?.id ? String(product.variants[0].id) : '');
    setBatchId(product.batches?.[0]?.id ? String(product.batches[0].id) : '');
    setQty(1);
  }, [product]);

  if (!product) return null;

  const selectedVariant = product.variants?.find((v) => String(v.id) === variantId);
  const selectedBatch = product.batches?.find((b) => String(b.id) === batchId);
  const unitPrice = product.price + (selectedVariant?.additional_price ?? 0);

  function handleConfirm() {
    if (!product) return;
    onConfirm({
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      variant_id: selectedVariant?.id ?? null,
      variant_name: selectedVariant?.name ?? null,
      batch_id: selectedBatch?.id ?? null,
      batch_no: selectedBatch?.batch_no ?? null,
      sale_unit_id: product.sale_unit_id,
      net_unit_price: unitPrice,
      tax_rate: 0,
      qty,
      stock: product.stock
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Choose the variant / batch and quantity to add to the cart.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {product.is_variant && product.variants && product.variants.length > 0 && (
            <Field>
              <FieldLabel>Variant</FieldLabel>
              <Select value={variantId} onValueChange={(value) => setVariantId(value ?? '')}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select variant' />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant.id} value={String(variant.id)}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {product.is_batch && product.batches && product.batches.length > 0 && (
            <Field>
              <FieldLabel>Batch</FieldLabel>
              <Select value={batchId} onValueChange={(value) => setBatchId(value ?? '')}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select batch' />
                </SelectTrigger>
                <SelectContent>
                  {product.batches.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>
                      {batch.batch_no}
                      {batch.expired_date ? ` (exp. ${batch.expired_date})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field>
            <FieldLabel>Quantity</FieldLabel>
            <div className='flex items-center gap-2'>
              <Button type='button' variant='outline' size='icon' onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Icons.minus className='h-4 w-4' />
              </Button>
              <Input
                type='number'
                min={1}
                step='0.0001'
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 1)}
                className='text-center'
              />
              <Button type='button' variant='outline' size='icon' onClick={() => setQty((q) => q + 1)}>
                <Icons.add className='h-4 w-4' />
              </Button>
            </div>
          </Field>

          <p className='text-muted-foreground text-sm'>Unit price: {unitPrice.toFixed(2)}</p>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={handleConfirm}>
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
