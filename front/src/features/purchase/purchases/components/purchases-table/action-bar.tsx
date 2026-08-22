'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Can } from '@/components/can';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeletePurchasesMutation } from '../../api/mutations';
import { purchaseKeys } from '../../api/queries';
import type { Purchase } from '../../api/types';

interface PurchasesTableActionBarProps {
  table: Table<Purchase>;
}

export function PurchasesTableActionBar({ table }: PurchasesTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeletePurchasesMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
      toast.success(`${selectedRows.length} purchase(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => toast.error('Failed to delete selected purchases')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected purchases?'
        description='This action cannot be undone and will reverse the received stock.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_PURCHASE_PURCHASES'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
