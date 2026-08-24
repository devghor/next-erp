'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteDeliveriesMutation } from '../../api/mutations';
import { deliveryKeys } from '../../api/queries';
import type { Delivery } from '../../api/types';
import { Can } from '@/components/can';

interface DeliveriesTableActionBarProps {
  table: Table<Delivery>;
}

export function DeliveriesTableActionBar({ table }: DeliveriesTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteDeliveriesMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: deliveryKeys.all });
      toast.success(`${selectedRows.length} delivery(ies) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to delete selected deliveries');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected deliveries?'
        description='This cannot be undone.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_SALE_DELIVERIES'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
