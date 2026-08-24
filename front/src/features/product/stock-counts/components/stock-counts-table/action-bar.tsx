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
import { bulkDeleteStockCountsMutation } from '../../api/mutations';
import { stockCountKeys } from '../../api/queries';
import type { StockCount } from '../../api/types';

interface StockCountsTableActionBarProps {
  table: Table<StockCount>;
}

export function StockCountsTableActionBar({ table }: StockCountsTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteStockCountsMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
      toast.success(`${selectedRows.length} stock count(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => toast.error('Failed to delete selected stock counts')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected stock counts?'
        description='Adjusted stock counts are skipped. This action cannot be undone.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_PRODUCT_STOCK_COUNTS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
