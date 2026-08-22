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
import { createBarcodeSettingMutation, updateBarcodeSettingMutation } from '../api/mutations';
import { barcodeSettingKeys } from '../api/queries';
import type { BarcodeSetting } from '../api/types';
import { toast } from 'sonner';
import { barcodeSettingSchema } from '../schemas/barcode-setting';

interface BarcodeSettingFormSheetProps {
  barcodeSetting?: BarcodeSetting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarcodeSettingFormSheet({
  barcodeSetting,
  open,
  onOpenChange
}: BarcodeSettingFormSheetProps) {
  const isEdit = !!barcodeSetting;

  const createMutation = useMutation({
    ...createBarcodeSettingMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
      toast.success('Barcode setting created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create barcode setting. Try again.")
  });

  const updateMutation = useMutation({
    ...updateBarcodeSettingMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
      toast.success('Barcode setting updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update barcode setting. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: barcodeSetting?.name ?? '',
      description: barcodeSetting?.description ?? '',
      width: barcodeSetting?.width ?? 40,
      height: barcodeSetting?.height ?? 25,
      paper_width: barcodeSetting?.paper_width ?? 0,
      paper_height: barcodeSetting?.paper_height ?? 0,
      top_margin: barcodeSetting?.top_margin ?? 0,
      left_margin: barcodeSetting?.left_margin ?? 0,
      row_distance: barcodeSetting?.row_distance ?? 0,
      col_distance: barcodeSetting?.col_distance ?? 0,
      stickers_in_one_row: barcodeSetting?.stickers_in_one_row ?? 3,
      stickers_in_one_sheet: barcodeSetting?.stickers_in_one_sheet ?? 30,
      is_default: barcodeSetting?.is_default ?? false
    },
    validators: {
      onSubmit: barcodeSettingSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        paper_width: value.paper_width || null,
        paper_height: value.paper_height || null
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: barcodeSetting.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Barcode Setting' : 'New Barcode Setting'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the label paper/template details below.'
              : 'Define a new label paper/template for printing barcodes.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='barcode-setting-form-sheet'
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
                  <field.TextField label='Name' required placeholder='40x25 Sheet Label' />
                )}
              />

              <form.AppField
                name='description'
                children={(field) => <field.TextareaField label='Description' />}
              />

              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='width'
                  children={(field) => (
                    <field.TextField label='Label Width (mm)' type='number' step='0.01' required />
                  )}
                />
                <form.AppField
                  name='height'
                  children={(field) => (
                    <field.TextField label='Label Height (mm)' type='number' step='0.01' required />
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='paper_width'
                  children={(field) => (
                    <field.TextField label='Paper Width (mm)' type='number' step='0.01' />
                  )}
                />
                <form.AppField
                  name='paper_height'
                  children={(field) => (
                    <field.TextField label='Paper Height (mm)' type='number' step='0.01' />
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='top_margin'
                  children={(field) => (
                    <field.TextField label='Top Margin (mm)' type='number' step='0.01' />
                  )}
                />
                <form.AppField
                  name='left_margin'
                  children={(field) => (
                    <field.TextField label='Left Margin (mm)' type='number' step='0.01' />
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='row_distance'
                  children={(field) => (
                    <field.TextField label='Row Distance (mm)' type='number' step='0.01' />
                  )}
                />
                <form.AppField
                  name='col_distance'
                  children={(field) => (
                    <field.TextField label='Column Distance (mm)' type='number' step='0.01' />
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='stickers_in_one_row'
                  children={(field) => (
                    <field.TextField label='Labels per Row' type='number' step='1' required />
                  )}
                />
                <form.AppField
                  name='stickers_in_one_sheet'
                  children={(field) => (
                    <field.TextField label='Labels per Sheet' type='number' step='1' required />
                  )}
                />
              </div>

              <form.AppField
                name='is_default'
                children={(field) => (
                  <field.SwitchField
                    label='Default template'
                    description='Preselected when printing barcodes.'
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
          <LoadingButton loading={isPending} type='submit' form='barcode-setting-form-sheet'>
            {isEdit ? 'Update Setting' : 'Create Setting'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function BarcodeSettingFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <BarcodeSettingFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
