'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { AddButton } from '@/components/buttons/add-button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createRoleMutation, updateRoleMutation } from '../api/mutations';
import { roleKeys, permissionGroupsQueryOptions } from '../api/queries';
import type { Role } from '../api/types';
import { toast } from 'sonner';
import { roleSchema } from '../schemas/role';
import { PermissionPicker } from './permission-picker';

interface RoleFormSheetProps {
  role?: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleFormSheet({ role, open, onOpenChange }: RoleFormSheetProps) {
  const isEdit = !!role;

  const permissionGroups = useQuery({ ...permissionGroupsQueryOptions(), enabled: open });

  const createMutation = useMutation({
    ...createRoleMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
      toast.success('Role created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create role. Try again.")
  });

  const updateMutation = useMutation({
    ...updateRoleMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: roleKeys.all });
      toast.success('Role updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update role. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: role?.name ?? '',
      permissions: role?.permissions ?? []
    },
    validators: {
      onSubmit: roleSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: role.id, values: value });
      } else {
        await createMutation.mutateAsync(value);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Role' : 'New Role'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the role details below.'
              : 'Fill in the details to create a new role.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='role-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='name'
                children={(field) => <field.TextField label='Name' required placeholder='Editor' />}
              />

              {permissionGroups.isPending ? (
                <div className='animate-pulse space-y-2'>
                  <div className='bg-muted h-24 w-full rounded-lg' />
                  <div className='bg-muted h-24 w-full rounded-lg' />
                </div>
              ) : (
                <form.Field
                  name='permissions'
                  mode='array'
                  children={(field) => (
                    <PermissionPicker field={field} groups={permissionGroups.data?.data ?? []} />
                  )}
                />
              )}
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='role-form-sheet'>
            {isEdit ? 'Update Role' : 'Create Role'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function RoleFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <RoleFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
