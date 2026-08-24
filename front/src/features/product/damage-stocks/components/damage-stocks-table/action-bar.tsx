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
import { bulkDeleteDamageStocksMutation } from '../../api/mutations';
import { damageStockKeys } from '../../api/queries';
import type { DamageStock } from '../../api/types';

interface DamageStocksTableActionBarProps {
  table: Table<DamageStock>;
}

export function DamageStocksTableActionBar({ table }: DamageStocksTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteDamageStocksMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: damageStockKeys.all });
      toast.success(`${selectedRows.length} damage stock(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => toast.error('Failed to delete selected damage stocks')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected damage stocks?'
        description='This action cannot be undone and will restore the deducted stock.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_PRODUCT_DAMAGE_STOCKS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
