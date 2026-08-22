'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { createUnitMutation, updateUnitMutation } from '../api/mutations';
import { unitKeys, unitsQueryOptions } from '../api/queries';
import type { Unit } from '../api/types';
import { toast } from 'sonner';
import { unitSchema, NO_BASE_UNIT } from '../schemas/unit';

const OPERATOR_OPTIONS = [
  { value: '*', label: 'Multiply (×)' },
  { value: '/', label: 'Divide (÷)' }
];

interface UnitFormSheetProps {
  unit?: Unit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitFormSheet({ unit, open, onOpenChange }: UnitFormSheetProps) {
  const isEdit = !!unit;

  const { data: baseUnitOptionsData } = useQuery({
    ...unitsQueryOptions({ per_page: 100 }),
    enabled: open
  });

  const baseUnitOptions = [
    { value: NO_BASE_UNIT, label: 'None' },
    ...(baseUnitOptionsData?.data ?? [])
      .filter((u) => u.id !== unit?.id)
      .map((u) => ({ value: String(u.id), label: u.name }))
  ];

  const createMutation = useMutation({
    ...createUnitMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
      toast.success('Unit created');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't create unit. Try again.")
  });

  const updateMutation = useMutation({
    ...updateUnitMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: unitKeys.all });
      toast.success('Unit updated');
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't update unit. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      code: unit?.code ?? '',
      name: unit?.name ?? '',
      base_unit_id: unit?.base_unit_id ? String(unit.base_unit_id) : NO_BASE_UNIT,
      operator: unit?.operator ?? '*',
      operation_value: unit?.operation_value ?? 1
    },
    validators: {
      onSubmit: unitSchema
    },
    onSubmit: async ({ value }) => {
      const hasBaseUnit = value.base_unit_id !== NO_BASE_UNIT;
      const payload = {
        code: value.code,
        name: value.name,
        base_unit_id: hasBaseUnit ? Number(value.base_unit_id) : null,
        operator: hasBaseUnit ? value.operator : ('*' as const),
        operation_value: hasBaseUnit ? Number(value.operation_value) : 1
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: unit.id, values: payload });
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
          <SheetTitle>{isEdit ? 'Edit Unit' : 'New Unit'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update the unit details below.' : 'Fill in the details to create a new unit.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='unit-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.AppField
                name='code'
                children={(field) => <field.TextField label='Code' required placeholder='KG' />}
              />

              <form.AppField
                name='name'
                children={(field) => (
                  <field.TextField label='Name' required placeholder='Kilogram' />
                )}
              />

              <form.AppField
                name='base_unit_id'
                children={(field) => (
                  <field.SelectField label='Base Unit' options={baseUnitOptions} />
                )}
              />

              <form.Subscribe selector={(state) => state.values.base_unit_id}>
                {(baseUnitId) =>
                  baseUnitId !== NO_BASE_UNIT ? (
                    <>
                      <form.AppField
                        name='operator'
                        children={(field) => (
                          <field.SelectField label='Operator' options={OPERATOR_OPTIONS} />
                        )}
                      />

                      <form.AppField
                        name='operation_value'
                        children={(field) => (
                          <field.TextField
                            label='Operation Value'
                            type='number'
                            step='0.0001'
                            required
                            placeholder='1'
                          />
                        )}
                      />
                    </>
                  ) : null
                }
              </form.Subscribe>
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={isPending} type='submit' form='unit-form-sheet'>
            {isEdit ? 'Update Unit' : 'Create Unit'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UnitFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <UnitFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
