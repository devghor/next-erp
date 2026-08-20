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
import { useMutation } from '@tanstack/react-query';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import type { User } from '../api/types';
import { toast } from 'sonner';
import { createUserSchema, updateUserSchema } from '../schemas/user';

interface UserFormSheetProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ user, open, onOpenChange }: UserFormSheetProps) {
  const isEdit = !!user;

  const createMutation = useMutation({
    ...createUserMutation,
    onSuccess: () => {
      toast.success('User created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create user. Try again.")
  });

  const updateMutation = useMutation({
    ...updateUserMutation,
    onSuccess: () => {
      toast.success('User updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update user. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: ''
    },
    validators: {
      onSubmit: (isEdit ? updateUserSchema : createUserSchema) as typeof createUserSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: user.id,
          values: {
            name: value.name,
            email: value.email,
            ...(value.password && { password: value.password })
          }
        });
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
          <SheetTitle>{isEdit ? 'Edit User' : 'New User'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the user details below.'
              : 'Fill in the details to create a new user.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='user-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='name'
                children={(field) => (
                  <field.TextField label='Name' required placeholder='John Doe' />
                )}
              />

              <form.AppField
                name='email'
                children={(field) => (
                  <field.TextField
                    label='Email'
                    required
                    type='email'
                    placeholder='john@example.com'
                  />
                )}
              />

              <form.AppField
                name='password'
                children={(field) => (
                  <field.TextField
                    label='Password'
                    required={!isEdit}
                    type='password'
                    placeholder={isEdit ? 'Leave blank to keep current password' : ''}
                  />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='user-form-sheet'>
            {isEdit ? 'Update User' : 'Create User'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
