'use client';
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
import { getQueryClient } from '@/lib/query-client';
import {
  deleteBarcodeSettingMutation,
  setDefaultBarcodeSettingMutation
} from '../../api/mutations';
import { barcodeSettingKeys } from '../../api/queries';
import type { BarcodeSetting } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarcodeSettingFormSheet } from '../barcode-setting-form-sheet';
import { Can } from '@/components/can';

interface CellActionProps {
  data: BarcodeSetting;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteBarcodeSettingMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
      toast.success('Barcode setting deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete barcode setting');
    }
  });

  const setDefaultMutation = useMutation({
    ...setDefaultBarcodeSettingMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
      toast.success('Default barcode setting updated');
    },
    onError: () => toast.error('Failed to set default barcode setting')
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <BarcodeSettingFormSheet barcodeSetting={data} open={editOpen} onOpenChange={setEditOpen} />
      <Can permission={['UPDATE_PRODUCT_BARCODE_SETTINGS', 'DELETE_PRODUCT_BARCODE_SETTINGS']}>
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
              <Can permission='UPDATE_PRODUCT_BARCODE_SETTINGS'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
                {!data.is_default && (
                  <DropdownMenuItem onClick={() => setDefaultMutation.mutate(data.id)}>
                    <Icons.check className='mr-2 h-4 w-4' /> Set as Default
                  </DropdownMenuItem>
                )}
              </Can>
              <Can permission='DELETE_PRODUCT_BARCODE_SETTINGS'>
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
