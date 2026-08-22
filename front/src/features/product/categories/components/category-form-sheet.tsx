'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { createCategoryMutation, updateCategoryMutation } from '../api/mutations';
import { categoryKeys, categoriesQueryOptions } from '../api/queries';
import type { Category } from '../api/types';
import { toast } from 'sonner';
import { categorySchema } from '../schemas/category';

const NO_PARENT = 'none';

interface CategoryFormSheetProps {
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryFormSheet({ category, open, onOpenChange }: CategoryFormSheetProps) {
  const isEdit = !!category;

  const { data: parentOptionsData } = useQuery({
    ...categoriesQueryOptions({ per_page: 100 }),
    enabled: open
  });

  const parentOptions = [
    { value: NO_PARENT, label: 'None' },
    ...(parentOptionsData?.data ?? [])
      .filter((c) => c.id !== category?.id)
      .map((c) => ({ value: String(c.id), label: c.name }))
  ];

  const createMutation = useMutation({
    ...createCategoryMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create category. Try again.")
  });

  const updateMutation = useMutation({
    ...updateCategoryMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Category updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update category. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: category?.name ?? '',
      parent_id: category?.parent_id ? String(category.parent_id) : NO_PARENT,
      image: [] as File[]
    },
    validators: {
      onSubmit: categorySchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        parent_id: value.parent_id === NO_PARENT ? null : Number(value.parent_id),
        image: value.image?.[0] ?? null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: category.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Category' : 'New Category'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the category details below.'
              : 'Fill in the details to create a new category.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='category-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {isEdit && category.image && (
                <div className='flex items-center gap-3'>
                  <Avatar size='lg'>
                    <AvatarImage src={category.image} alt={category.name} />
                    <AvatarFallback>{category.name.charAt(0).toUpperCase()}</AvatarFallback>
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
                  <field.TextField label='Name' required placeholder='Electronics' />
                )}
              />

              <form.AppField
                name='parent_id'
                children={(field) => (
                  <field.SelectField label='Parent Category' options={parentOptions} />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='category-form-sheet'>
            {isEdit ? 'Update Category' : 'Create Category'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CategoryFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <CategoryFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
