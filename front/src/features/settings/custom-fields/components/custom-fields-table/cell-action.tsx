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
import { deleteCustomFieldMutation } from '../../api/mutations';
import { customFieldKeys } from '../../api/queries';
import type { CustomField } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomFieldFormSheet } from '../custom-field-form-sheet';
import { Can } from '@/components/can';

interface CellActionProps {
  data: CustomField;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteCustomFieldMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
      toast.success('Custom field deleted successfully');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete custom field');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <CustomFieldFormSheet customField={data} open={editOpen} onOpenChange={setEditOpen} />
      <Can permission={['UPDATE_SETTINGS_CUSTOM_FIELDS', 'DELETE_SETTINGS_CUSTOM_FIELDS']}>
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
              <Can permission='UPDATE_SETTINGS_CUSTOM_FIELDS'>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Icons.edit className='mr-2 h-4 w-4' /> Update
                </DropdownMenuItem>
              </Can>
              <Can permission='DELETE_SETTINGS_CUSTOM_FIELDS'>
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
