'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteCurrenciesMutation } from '../../api/mutations';
import { currencyKeys } from '../../api/queries';
import type { Currency } from '../../api/types';
import { Can } from '@/components/can';

interface CurrenciesTableActionBarProps {
  table: Table<Currency>;
}

export function CurrenciesTableActionBar({ table }: CurrenciesTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteCurrenciesMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: currencyKeys.all });
      toast.success(`${selectedRows.length} currency(ies) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to delete selected currencies');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected currencies?'
        description='This action cannot be undone.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_SETTINGS_CURRENCIES'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
