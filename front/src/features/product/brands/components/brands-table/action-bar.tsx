'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteBrandsMutation } from '../../api/mutations';
import { brandKeys } from '../../api/queries';
import type { Brand } from '../../api/types';
import { Can } from '@/components/can';

interface BrandsTableActionBarProps {
  table: Table<Brand>;
}

export function BrandsTableActionBar({ table }: BrandsTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteBrandsMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
      toast.success(`${selectedRows.length} brand(s) deleted successfully`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to delete selected brands');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Delete selected brands?'
        description='This action cannot be undone.'
        confirmLabel='Delete'
      />
      <Can permission='DELETE_PRODUCT_BRANDS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Delete ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
