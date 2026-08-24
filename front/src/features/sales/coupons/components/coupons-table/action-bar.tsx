'use client';
import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { bulkDeleteCouponsMutation } from '../../api/mutations';
import { couponKeys } from '../../api/queries';
import type { Coupon } from '../../api/types';
import { Can } from '@/components/can';

interface CouponsTableActionBarProps {
  table: Table<Coupon>;
}

export function CouponsTableActionBar({ table }: CouponsTableActionBarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const bulkDeleteMutation = useMutation({
    ...bulkDeleteCouponsMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
      toast.success(`${selectedRows.length} coupon(s) deactivated`);
      setDeleteOpen(false);
      table.resetRowSelection();
    },
    onError: () => {
      toast.error('Failed to deactivate selected coupons');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows.map((row) => row.original.id))}
        loading={bulkDeleteMutation.isPending}
        title='Deactivate selected coupons?'
        description='Deactivated coupons can no longer be redeemed at checkout.'
        confirmLabel='Deactivate'
      />
      <Can permission='DELETE_SALE_COUPONS'>
        <Button variant='destructive' size='sm' onClick={() => setDeleteOpen(true)}>
          <Icons.trash className='mr-2 h-4 w-4' /> Deactivate ({selectedRows.length})
        </Button>
      </Can>
    </>
  );
}
