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
import { bulkDeleteSalesMutation } from '../../api/mutations';
import { saleKeys } from '../../api/queries';
import type { Sale } from '../../api/types';

interface SalesTableActionBarProps {
  table: Table<Sale>;
}

export function SalesTableActionBar({ table }: SalesTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteSalesMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
      toast.success(`${selectedRows.length} sale(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => toast.error('Failed to delete selected sales')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected sales?'
        description='This action cannot be undone and will reverse the deducted stock.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_SALE_SALES'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
