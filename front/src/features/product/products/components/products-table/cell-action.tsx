'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { Can } from '@/components/can';
import { getQueryClient } from '@/lib/query-client';
import { deleteProductMutation } from '../../api/mutations';
import { productKeys } from '../../api/queries';
import { printProductBarcode } from '../../api/service';
import type { Product } from '../../api/types';

interface CellActionProps {
  data: Product;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteProductMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => toast.error('Failed to delete product')
  });

  const barcodeMutation = useMutation({
    mutationFn: () => printProductBarcode(data.id, 1),
    onSuccess: (blob) => downloadBlob(blob, `barcode-${data.code}.pdf`),
    onError: () => toast.error('Failed to generate barcode')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <Can permission={['UPDATE_PRODUCT_PRODUCTS', 'DELETE_PRODUCT_PRODUCTS', 'READ_PRODUCT_PRODUCTS']}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <Can permission='READ_PRODUCT_PRODUCTS'>
                <DropdownMenuItem
                  render={<Link href={`/dashboard/product/products/${data.id}`} aria-label='View History' />}
                >
                  <Icons.eye className='mr-2 h-4 w-4' /> View History
                </DropdownMenuItem>
              </Can>
              <Can permission='UPDATE_PRODUCT_PRODUCTS'>
                <DropdownMenuItem
                  render={<Link href={`/dashboard/product/products/${data.id}/edit`} aria-label='Update' />}
                >
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
              </Can>
              <Can permission='READ_PRODUCT_PRODUCTS'>
                <DropdownMenuItem onClick={() => barcodeMutation.mutate()}>
                  <Icons.download className='mr-2 h-4 w-4' /> Print Barcode
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_PRODUCT_PRODUCTS'>
                <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                  <Icons.trash className='mr-2 h-4 w-4' /> Delete
                </DropdownMenuItem>
              </Can>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Can>
    </>
  );
}
