'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteUsersMutation } from '../../api/mutations';
import { userKeys } from '../../api/queries';
import type { User } from '../../api/types';

interface UsersTableActionBarProps {
  table: Table<User>;
}

export function UsersTableActionBar({ table }: UsersTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteUsersMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: userKeys.all });
      toast.success(`${selectedRows.length} user(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to delete selected users');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected users?'
        description='This action cannot be undone.'
        confirmLabel='Delete'
      />
      <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
        <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
      </Button>
    </>
  );
}
