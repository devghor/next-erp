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
import { deletePackingSlipMutation } from '../../api/mutations';
import { packingSlipKeys } from '../../api/queries';
import type { PackingSlip } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Can } from '@/components/can';

interface CellActionProps {
  data: PackingSlip;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deletePackingSlipMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: packingSlipKeys.all });
      toast.success('Packing slip deleted, stock restored');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete packing slip');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        title='Delete packing slip?'
        description='Packed stock will be restored and the lines unmarked. Only pending slips can be deleted.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_SALE_PACKING_SLIPS'>
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
              <DropdownMenuItem
                disabled={data.status !== 'pending'}
                onClick={() => setDeleteOpen(true)}
              >
                <Icons.trash className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Can>
    </>
  );
}
