'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AddButton } from '@/components/buttons/add-button';
import { useAppForm } from '@/lib/form';
import { getQueryClient } from '@/lib/query-client';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { categoriesQueryOptions } from '@/features/product/categories/api/queries';
import { brandsQueryOptions } from '@/features/product/brands/api/queries';
import { createStockCountMutation } from '../api/mutations';
import { stockCountKeys } from '../api/queries';
import { stockCountCreateSchema } from '../schemas/stock-count';

export function StockCountCreateDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton onClick={() => setOpen(true)} />
      <StockCountCreateDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

interface StockCountCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StockCountCreateDialog({ open, onOpenChange }: StockCountCreateDialogProps) {
  const router = useRouter();

  const { data: warehousesData } = useQuery({
    ...warehousesQueryOptions({ per_page: 100 }),
    enabled: open
  });
  const { data: categoriesData } = useQuery({
    ...categoriesQueryOptions({ per_page: 200 }),
    enabled: open
  });
  const { data: brandsData } = useQuery({
    ...brandsQueryOptions({ per_page: 200 }),
    enabled: open
  });

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({
    value: String(w.id),
    label: w.name
  }));
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categoriesData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))
  ];
  const brandOptions = [
    { value: '', label: 'All Brands' },
    ...(brandsData?.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))
  ];

  const createMutation = useMutation({
    ...createStockCountMutation,
    onSuccess: (stockCount) => {
      getQueryClient().invalidateQueries({ queryKey: stockCountKeys.all });
      toast.success('Stock count created');
      onOpenChange(false);
      form.reset();
      router.push(`/dashboard/product/stock-counts/${stockCount.id}`);
    },
    onError: () => toast.error("Couldn't create stock count. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      warehouse_id: '',
      category_id: '',
      brand_id: '',
      note: ''
    },
    validators: {
      onSubmit: stockCountCreateSchema
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        warehouse_id: Number(value.warehouse_id),
        category_ids: value.category_id ? [Number(value.category_id)] : null,
        brand_ids: value.brand_id ? [Number(value.brand_id)] : null,
        note: value.note || null
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>New Stock Count</DialogTitle>
          <DialogDescription>
            Snapshot current stock for a warehouse, optionally scoped to a category or brand.
          </DialogDescription>
        </DialogHeader>

        <form
          id='stock-count-create-dialog'
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className='grid grid-cols-1 gap-4'>
            <form.AppField
              name='warehouse_id'
              children={(field) => (
                <field.SelectField label='Warehouse' required options={warehouseOptions} />
              )}
            />
            <form.AppField
              name='category_id'
              children={(field) => <field.SelectField label='Category' options={categoryOptions} />}
            />
            <form.AppField
              name='brand_id'
              children={(field) => <field.SelectField label='Brand' options={brandOptions} />}
            />
            <form.AppField name='note' children={(field) => <field.TextareaField label='Note' />} />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={createMutation.isPending}
            type='submit'
            form='stock-count-create-dialog'
          >
            Create Stock Count
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
