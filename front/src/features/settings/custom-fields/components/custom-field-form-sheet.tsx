'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { getQueryClient } from '@/lib/query-client';
import { createCustomFieldMutation, updateCustomFieldMutation } from '../api/mutations';
import { customFieldKeys } from '../api/queries';
import type { CustomField, CustomFieldType } from '../api/types';
import { toast } from 'sonner';
import { customFieldSchema } from '../schemas/custom-field';

const TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select (single choice)' },
  { value: 'checkbox', label: 'Checkbox (multiple choice)' },
  { value: 'multi_select', label: 'Multi-select' }
];

const OPTION_TYPES = new Set<CustomFieldType>(['select', 'checkbox', 'multi_select']);

interface CustomFieldFormSheetProps {
  customField?: CustomField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomFieldFormSheet({
  customField,
  open,
  onOpenChange
}: CustomFieldFormSheetProps) {
  const isEdit = !!customField;

  const createMutation = useMutation({
    ...createCustomFieldMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
      toast.success('Custom field created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create custom field. Try again.")
  });

  const updateMutation = useMutation({
    ...updateCustomFieldMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: customFieldKeys.all });
      toast.success('Custom field updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update custom field. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      belongs_to: customField?.belongs_to ?? 'product',
      name: customField?.name ?? '',
      type: (customField?.type ?? 'text') as CustomFieldType,
      options: customField?.options ?? ([] as string[]),
      is_table: customField?.is_table ?? false,
      is_required: customField?.is_required ?? false
    },
    validators: {
      onSubmit: customFieldSchema
    },
    onSubmit: async ({ value }) => {
      const hasOptions = OPTION_TYPES.has(value.type);
      const payload = {
        belongs_to: value.belongs_to,
        name: value.name,
        type: value.type,
        options: hasOptions ? value.options : null,
        is_table: value.is_table,
        is_required: value.is_required
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: customField.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Custom Field' : 'New Custom Field'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the custom field details below.'
              : 'Fill in the details to create a new custom field.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='custom-field-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='belongs_to'
                children={(field) => (
                  <field.TextField
                    label='Belongs To'
                    required
                    placeholder='product'
                    description='Entity this field attaches to, e.g. product.'
                  />
                )}
              />

              <form.AppField
                name='name'
                children={(field) => (
                  <field.TextField label='Name' required placeholder='Warranty Card No.' />
                )}
              />

              <form.AppField
                name='type'
                children={(field) => (
                  <field.SelectField label='Type' required options={TYPE_OPTIONS} />
                )}
              />

              <form.Subscribe selector={(state) => state.values.type}>
                {(type) =>
                  OPTION_TYPES.has(type) ? (
                    <form.AppField
                      name='options'
                      mode='array'
                      children={(field) => (
                        <field.TagsField
                          label='Options'
                          required
                          placeholder='Type an option and press Enter...'
                        />
                      )}
                    />
                  ) : null
                }
              </form.Subscribe>

              <form.AppField
                name='is_table'
                children={(field) => (
                  <field.CheckboxField
                    label='Show as a table column'
                    description='Displays this field as a column in the listing table.'
                  />
                )}
              />

              <form.AppField
                name='is_required'
                children={(field) => (
                  <field.CheckboxField label='Required' description='Make this field mandatory.' />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='custom-field-form-sheet'>
            {isEdit ? 'Update Custom Field' : 'Create Custom Field'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CustomFieldFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <CustomFieldFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
