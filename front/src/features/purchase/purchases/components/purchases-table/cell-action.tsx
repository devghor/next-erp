'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { deletePurchaseMutation } from '../../api/mutations';
import { purchaseKeys, purchaseQueryOptions } from '../../api/queries';
import type { Purchase } from '../../api/types';
import { PurchaseFormDialog } from '../purchase-form-dialog';

interface CellActionProps {
  data: Purchase;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: fullPurchase } = useQuery({ ...purchaseQueryOptions(data.id), enabled: editOpen });

  const deleteMutation = useMutation({
    ...deletePurchaseMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success('Purchase deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => toast.error('Failed to delete purchase')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      {editOpen && (
        <PurchaseFormDialog purchase={fullPurchase ?? data} open={editOpen} onOpenChange={setEditOpen} />
      )}
      <Can permission={['UPDATE_PURCHASE_PURCHASES', 'DELETE_PURCHASE_PURCHASES']}>
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
              <Can permission='UPDATE_PURCHASE_PURCHASES'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_PURCHASE_PURCHASES'>
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
