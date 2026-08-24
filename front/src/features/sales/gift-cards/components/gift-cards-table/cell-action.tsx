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
import { deleteGiftCardMutation } from '../../api/mutations';
import { giftCardKeys } from '../../api/queries';
import type { GiftCard } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GiftCardFormSheet } from '../gift-card-form-sheet';
import { GiftCardRechargeDialog } from '../gift-card-recharge-dialog';
import { Can } from '@/components/can';

interface CellActionProps {
  data: GiftCard;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteGiftCardMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
      toast.success('Gift card deactivated successfully');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to deactivate gift card');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        title='Deactivate gift card?'
        description='The card will no longer be usable as payment. This cannot be undone from here.'
        confirmLabel='Deactivate'
      />
      <GiftCardFormSheet giftCard={data} open={editOpen} onOpenChange={setEditOpen} />
      <GiftCardRechargeDialog giftCard={data} open={rechargeOpen} onOpenChange={setRechargeOpen} />
      <Can permission={['UPDATE_SALE_GIFT_CARDS', 'DELETE_SALE_GIFT_CARDS']}>
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
              <Can permission='UPDATE_SALE_GIFT_CARDS'>
                <DropdownMenuItem onClick={() => setRechargeOpen(true)}>
                  <Icons.plusCircle className='mr-2 h-4 w-4' /> Recharge
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_SALE_GIFT_CARDS'>
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
