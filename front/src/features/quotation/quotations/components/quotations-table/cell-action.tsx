'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { Can } from '@/components/can';
import { getQueryClient } from '@/lib/query-client';
import { deleteQuotationMutation, sendQuotationMailMutation } from '../../api/mutations';
import { quotationKeys, quotationQueryOptions } from '../../api/queries';
import type { Quotation } from '../../api/types';
import { QuotationFormDialog } from '../quotation-form-dialog';

interface CellActionProps {
  data: Quotation;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: fullQuotation } = useQuery({ ...quotationQueryOptions(data.id), enabled: editOpen });

  const deleteMutation = useMutation({
    ...deleteQuotationMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: quotationKeys.all });
      toast.success('Quotation deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => toast.error('Failed to delete quotation')
  });

  const sendMailMutation = useMutation({
    ...sendQuotationMailMutation,
    onSuccess: () => toast.success('Quotation emailed to customer'),
    onError: () => toast.error('Failed to send quotation email')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      {editOpen && (
        <QuotationFormDialog quotation={fullQuotation ?? data} open={editOpen} onOpenChange={setEditOpen} />
      )}
      <Can
        permission={[
          'UPDATE_QUOTATION_QUOTATIONS',
          'DELETE_QUOTATION_QUOTATIONS',
          'CREATE_SALE_SALES',
          'CREATE_PURCHASE_PURCHASES'
        ]}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0' />}>
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <Can permission='UPDATE_QUOTATION_QUOTATIONS'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => sendMailMutation.mutate(data.id)}
                  disabled={sendMailMutation.isPending}
                >
                  <Icons.mail className='mr-2 h-4 w-4' /> Send Mail
                </DropdownMenuItem>
              </Can>
              <Can permission='CREATE_SALE_SALES'>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/sales/create?from_quotation=${data.id}`)}
                >
                  <Icons.sale className='mr-2 h-4 w-4' /> Convert to Sale
                </DropdownMenuItem>
              </Can>
              <Can permission='CREATE_PURCHASE_PURCHASES'>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/dashboard/purchase/purchases?from_quotation=${data.id}`)
                  }
                >
                  <Icons.purchase className='mr-2 h-4 w-4' /> Convert to Purchase
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_QUOTATION_QUOTATIONS'>
                <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                  <Icons.trash className='mr-2 h-4 w-4' /> Delete
                </DropdownMenuItem>
              </Can>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Can>
    </>
  );
}
