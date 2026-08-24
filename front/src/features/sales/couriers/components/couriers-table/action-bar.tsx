'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteCouriersMutation } from '../../api/mutations';
import { courierKeys } from '../../api/queries';
import type { Courier } from '../../api/types';
import { Can } from '@/components/can';

interface CouriersTableActionBarProps {
  table: Table<Courier>;
}

export function CouriersTableActionBar({ table }: CouriersTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteCouriersMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: courierKeys.all });
      toast.success(`${selectedRows.length} courier(s) deactivated successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to deactivate selected couriers');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Deactivate selected couriers?'
        description='They will no longer be selectable for new deliveries.'
        confirmLabel='Deactivate'
      />
      <Can permission='DELETE_SALE_COURIERS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Deactivate ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
