'use client';
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
import { getQueryClient } from '@/lib/query-client';
import { deleteCourierMutation } from '../../api/mutations';
import { courierKeys } from '../../api/queries';
import type { Courier } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CourierFormSheet } from '../courier-form-sheet';
import { Can } from '@/components/can';

interface CellActionProps {
  data: Courier;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteCourierMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
      toast.success('Courier deactivated successfully');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to deactivate courier');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        title='Deactivate this courier?'
        description='It will no longer be selectable for new deliveries.'
        confirmLabel='Deactivate'
      />
      <CourierFormSheet courier={data} open={editOpen} onOpenChange={setEditOpen} />
      <Can permission={['UPDATE_SALE_COURIERS', 'DELETE_SALE_COURIERS']}>
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
              <Can permission='UPDATE_SALE_COURIERS'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_SALE_COURIERS'>
                <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                  <Icons.trash className='mr-2 h-4 w-4' /> Deactivate
                </DropdownMenuItem>
              </Can>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Can>
    </>
  );
}
