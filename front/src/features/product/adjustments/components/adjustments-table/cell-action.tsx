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
import { deleteAdjustmentMutation } from '../../api/mutations';
import { adjustmentKeys, adjustmentQueryOptions } from '../../api/queries';
import type { Adjustment } from '../../api/types';
import { AdjustmentFormDialog } from '../adjustment-form-dialog';

interface CellActionProps {
  data: Adjustment;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: fullAdjustment } = useQuery({
    ...adjustmentQueryOptions(data.id),
    enabled: editOpen
  });

  const deleteMutation = useMutation({
    ...deleteAdjustmentMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
      toast.success('Adjustment deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => toast.error('Failed to delete adjustment')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        description='This action cannot be undone and will reverse the stock change.'
      />
      {editOpen && (
        <AdjustmentFormDialog
          adjustment={fullAdjustment ?? data}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      <Can permission={['UPDATE_PRODUCT_ADJUSTMENTS', 'DELETE_PRODUCT_ADJUSTMENTS']}>
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
              <Can permission='UPDATE_PRODUCT_ADJUSTMENTS'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_PRODUCT_ADJUSTMENTS'>
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
