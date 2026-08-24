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
import { deleteDeliveryMutation, trackDeliveryMutation } from '../../api/mutations';
import { deliveryKeys } from '../../api/queries';
import type { Delivery } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Can } from '@/components/can';

interface CellActionProps {
  data: Delivery;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteDeliveryMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success('Delivery deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete delivery');
    }
  });

  const trackMutation = useMutation({
    ...trackDeliveryMutation,
    onSuccess: (updated) => {
      getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success(`Status: ${updated.status}${updated.tracking_code ? ` (${updated.tracking_code})` : ''}`);
    },
    onError: () => {
      toast.error('Failed to fetch tracking status');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        title='Delete delivery?'
        description='This cannot be undone.'
        confirmLabel='Delete'
      />
      <Can permission={['READ_SALE_DELIVERIES', 'DELETE_SALE_DELIVERIES']}>
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
              {data.courier_id && (
                <DropdownMenuItem
                  disabled={trackMutation.isPending}
                  onClick={() => trackMutation.mutate(data.id)}
                >
                  <Icons.refresh className='mr-2 h-4 w-4' /> Track
                </DropdownMenuItem>
              )}
              <Can permission='DELETE_SALE_DELIVERIES'>
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
