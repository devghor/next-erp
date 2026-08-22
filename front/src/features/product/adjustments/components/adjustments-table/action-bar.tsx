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
import { bulkDeleteAdjustmentsMutation } from '../../api/mutations';
import { adjustmentKeys } from '../../api/queries';
import type { Adjustment } from '../../api/types';

interface AdjustmentsTableActionBarProps {
  table: Table<Adjustment>;
}

export function AdjustmentsTableActionBar({ table }: AdjustmentsTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteAdjustmentsMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: adjustmentKeys.all });
      toast.success(`${selectedRows.length} adjustment(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => toast.error('Failed to delete selected adjustments')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected adjustments?'
        description='This action cannot be undone and will reverse the stock changes.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_PRODUCT_ADJUSTMENTS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
