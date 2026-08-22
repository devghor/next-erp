'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { getQueryClient } from '@/lib/query-client';
import { createBrandMutation, updateBrandMutation } from '../api/mutations';
import { brandKeys } from '../api/queries';
import type { Brand } from '../api/types';
import { toast } from 'sonner';
import { brandSchema } from '../schemas/brand';

interface BrandFormSheetProps {
  brand?: Brand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandFormSheet({ brand, open, onOpenChange }: BrandFormSheetProps) {
  const isEdit = !!brand;

  const createMutation = useMutation({
    ...createBrandMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create brand. Try again.")
  });

  const updateMutation = useMutation({
    ...updateBrandMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update brand. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: brand?.name ?? '',
      image: [] as File[]
    },
    validators: {
      onSubmit: brandSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        image: value.image?.[0] ?? null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: brand.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Brand' : 'New Brand'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the brand details below.'
              : 'Fill in the details to create a new brand.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='brand-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {isEdit && brand.image && (
                <div className='flex items-center gap-3'>
                  <Avatar size='lg'>
                    <AvatarImage src={brand.image} alt={brand.name} />
                    <AvatarFallback>{brand.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className='text-muted-foreground text-sm'>Current image</p>
                </div>
              )}

              <form.AppField
                name='image'
                children={(field) => (
                  <field.FileUploadField
                    label='Image'
                    description='PNG or JPG up to 2MB.'
                    maxSize={2 * 1024 * 1024}
                    maxFiles={1}
                  />
                )}
              />

              <form.AppField
                name='name'
                children={(field) => (
                  <field.TextField label='Name' required placeholder='Samsung' />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='brand-form-sheet'>
            {isEdit ? 'Update Brand' : 'Create Brand'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function BrandFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <BrandFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
