'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { deleteStockCountMutation } from '../../api/mutations';
import { stockCountKeys } from '../../api/queries';
import type { StockCount } from '../../api/types';

interface CellActionProps {
  data: StockCount;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteStockCountMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
      toast.success('Stock count deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => toast.error('Failed to delete stock count')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        description='This action cannot be undone.'
      />
      <Can permission={['READ_PRODUCT_STOCK_COUNTS', 'DELETE_PRODUCT_STOCK_COUNTS']}>
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
              <Can permission='READ_PRODUCT_STOCK_COUNTS'>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/product/stock-counts/${data.id}`)}
                >
                  <Icons.eye className='mr-2 h-4 w-4' /> View
                </DropdownMenuItem>
              </Can>
              {data.status !== 'adjusted' && (
                <Can permission='DELETE_PRODUCT_STOCK_COUNTS'>
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                    <Icons.trash className='mr-2 h-4 w-4' /> Delete
                  </DropdownMenuItem>
                </Can>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Can>
    </>
  );
}
