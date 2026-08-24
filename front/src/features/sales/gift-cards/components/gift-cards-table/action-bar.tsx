'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteGiftCardsMutation } from '../../api/mutations';
import { giftCardKeys } from '../../api/queries';
import type { GiftCard } from '../../api/types';
import { Can } from '@/components/can';

interface GiftCardsTableActionBarProps {
  table: Table<GiftCard>;
}

export function GiftCardsTableActionBar({ table }: GiftCardsTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteGiftCardsMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
      toast.success(`${selectedRows.length} gift card(s) deactivated successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to deactivate selected gift cards');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Deactivate selected gift cards?'
        description='These cards will no longer be usable as payment.'
        confirmLabel='Deactivate'
      />
      <Can permission='DELETE_SALE_GIFT_CARDS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Deactivate ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
