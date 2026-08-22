'use client';

import { useState, type ReactNode } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/lib/form';
import { getQueryClient } from '@/lib/query-client';
import { categoriesQueryOptions } from '@/features/product/categories/api/queries';
import { brandsQueryOptions } from '@/features/product/brands/api/queries';
import { unitsQueryOptions } from '@/features/product/units/api/queries';
import { taxesQueryOptions } from '@/features/settings/taxes/api/queries';
import { warehousesQueryOptions } from '@/features/settings/warehouses/api/queries';
import { customFieldsQueryOptions } from '@/features/settings/custom-fields/api/queries';
import { createProductMutation, updateProductMutation } from '../api/mutations';
import { productKeys, productsQueryOptions } from '../api/queries';
import { productSchema } from '../schemas/product';
import type {
  VariantRowValues,
  BatchRowValues,
  ComboRowValues,
  InitialStockRowValues
} from '../schemas/product';
import type { Product, ProductType } from '../api/types';
import { ProductVariantsEditor } from './product-variants-editor';
import { ProductBatchesEditor } from './product-batches-editor';
import { ProductComboEditor } from './product-combo-editor';
import { ProductInitialStockEditor } from './product-initial-stock-editor';
import { ProductCustomFieldsEditor } from './product-custom-fields-editor';

const NONE = 'none';
const TYPE_PILLS: { value: ProductType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'combo', label: 'Combo' },
  { value: 'digital', label: 'Digital' },
  { value: 'service', label: 'Service' }
];
const TAX_METHOD_OPTIONS = [
  { value: '1', label: 'Exclusive' },
  { value: '2', label: 'Inclusive' }
];
const DURATION_OPTIONS = [
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' }
];

function SectionCard({
  icon: Icon,
  title,
  hint,
  children
}: {
  icon: (typeof Icons)[keyof typeof Icons];
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className='flex-row items-center gap-2 border-b pb-4'>
        <Icon className='text-muted-foreground h-4 w-4' />
        <CardTitle className='text-sm font-semibold'>{title}</CardTitle>
        {hint && <span className='text-muted-foreground ml-auto text-xs'>{hint}</span>}
      </CardHeader>
      <CardContent className='space-y-4'>{children}</CardContent>
    </Card>
  );
}

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;

  const { data: categoriesData } = useQuery(categoriesQueryOptions({ per_page: 200 }));
  const { data: brandsData } = useQuery(brandsQueryOptions({ per_page: 200 }));
  const { data: unitsData } = useQuery(unitsQueryOptions({ per_page: 200 }));
  const { data: taxesData } = useQuery(taxesQueryOptions({ per_page: 200 }));
  const { data: warehousesData } = useQuery(warehousesQueryOptions({ per_page: 200 }));
  const { data: productsData } = useQuery(productsQueryOptions({ per_page: 200 }));
  const { data: customFieldsData } = useQuery(customFieldsQueryOptions({ belongs_to: 'product', per_page: 100 }));

  const categoryOptions = (categoriesData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }));
  const brandOptions = [
    { value: NONE, label: 'None' },
    ...(brandsData?.data ?? []).map((b) => ({ value: String(b.id), label: b.name }))
  ];
  const unitOptions = [
    { value: NONE, label: 'None' },
    ...(unitsData?.data ?? []).map((u) => ({ value: String(u.id), label: u.name }))
  ];
  const taxOptions = [
    { value: NONE, label: 'None' },
    ...(taxesData?.data ?? []).map((t) => ({ value: String(t.id), label: t.name }))
  ];
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const componentOptions = (productsData?.data ?? [])
    .filter((p) => p.id !== product?.id)
    .map((p) => ({ value: String(p.id), label: `${p.name} (${p.code})` }));

  const [variants, setVariants] = useState<VariantRowValues[]>(
    product?.variants?.map((v) => ({
      name: v.name ?? '',
      item_code: v.item_code,
      additional_cost: Number(v.additional_cost),
      additional_price: Number(v.additional_price)
    })) ?? []
  );
  const [batches, setBatches] = useState<BatchRowValues[]>(
    product?.batches?.map((b) => ({ batch_no: b.batch_no, expired_date: b.expired_date ?? '' })) ?? []
  );
  const [comboItems, setComboItems] = useState<ComboRowValues[]>(
    product?.combo_items?.map((c) => ({
      component_product_id: c.component_product_id,
      component_product_name: c.component_product_name,
      qty: Number(c.qty),
      unit_price: Number(c.unit_price),
      wastage_percent: Number(c.wastage_percent ?? 0)
    })) ?? []
  );
  const [initialStock, setInitialStock] = useState<InitialStockRowValues[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<number, string>>({});

  const createMutation = useMutation({
    ...createProductMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created');
      onSuccess?.();
    },
    onError: () => toast.error("Couldn't create product. Try again.")
  });

  const updateMutation = useMutation({
    ...updateProductMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product updated');
      onSuccess?.();
    },
    onError: () => toast.error("Couldn't update product. Try again.")
  });

  const form = useAppForm({
    defaultValues: {
      name: product?.name ?? '',
      code: product?.code ?? '',
      type: product?.type ?? 'standard',
      category_id: product?.category_id ? String(product.category_id) : '',
      brand_id: product?.brand_id ? String(product.brand_id) : NONE,
      unit_id: product?.unit_id ? String(product.unit_id) : NONE,
      purchase_unit_id: product?.purchase_unit_id ? String(product.purchase_unit_id) : NONE,
      sale_unit_id: product?.sale_unit_id ? String(product.sale_unit_id) : NONE,
      tax_id: product?.tax_id ? String(product.tax_id) : NONE,
      cost: product?.cost ?? 0,
      price: product?.price ?? 0,
      wholesale_price: product?.wholesale_price ?? undefined,
      min_wholesale_qty: product?.min_wholesale_qty ?? undefined,
      tax_method: product ? (String(product.tax_method) as '1' | '2') : '1',
      alert_quantity: product?.alert_quantity ?? 0,
      has_warranty: product?.has_warranty ?? false,
      warranty_value: product?.warranty_value ?? 0,
      warranty_type: product?.warranty_type ?? '',
      has_guarantee: product?.has_guarantee ?? false,
      guarantee_value: product?.guarantee_value ?? 0,
      guarantee_type: product?.guarantee_type ?? '',
      starting_date: product?.starting_date ?? '',
      last_date: product?.last_date ?? '',
      is_variant: product?.is_variant ?? false,
      is_imei: product?.is_imei ?? false,
      is_batch: product?.is_batch ?? false,
      is_recipe: product?.is_recipe ?? false,
      wastage_percent: product?.wastage_percent ?? 0,
      profit_margin: product?.profit_margin ?? 0,
      product_details: product?.product_details ?? '',
      images: [] as File[]
    },
    validators: {
      onSubmit: productSchema
    },
    onSubmit: async ({ value }) => {
      if (value.is_variant && variants.length === 0) {
        toast.error('Add at least one variant');
        return;
      }
      if (value.is_batch && batches.length === 0) {
        toast.error('Add at least one batch');
        return;
      }
      if (value.type === 'combo' && comboItems.length === 0) {
        toast.error('Add at least one combo component');
        return;
      }

      const payload = {
        name: value.name,
        code: value.code,
        type: value.type,
        category_id: Number(value.category_id),
        brand_id: value.brand_id === NONE ? null : Number(value.brand_id),
        unit_id: value.unit_id === NONE ? null : Number(value.unit_id),
        purchase_unit_id: value.purchase_unit_id === NONE ? null : Number(value.purchase_unit_id),
        sale_unit_id: value.sale_unit_id === NONE ? null : Number(value.sale_unit_id),
        tax_id: value.tax_id === NONE ? null : Number(value.tax_id),
        cost: value.cost,
        price: value.price,
        wholesale_price: value.wholesale_price ?? null,
        min_wholesale_qty: value.min_wholesale_qty ?? null,
        tax_method: Number(value.tax_method) as 1 | 2,
        alert_quantity: value.alert_quantity,
        has_warranty: value.has_warranty,
        warranty_value: value.has_warranty ? value.warranty_value : null,
        warranty_type: value.has_warranty ? value.warranty_type : null,
        has_guarantee: value.has_guarantee,
        guarantee_value: value.has_guarantee ? value.guarantee_value : null,
        guarantee_type: value.has_guarantee ? value.guarantee_type : null,
        starting_date: value.starting_date || null,
        last_date: value.last_date || null,
        is_variant: value.is_variant,
        is_imei: value.is_imei,
        is_batch: value.is_batch,
        is_recipe: value.is_recipe,
        wastage_percent: value.wastage_percent ?? null,
        profit_margin: value.profit_margin ?? null,
        product_details: value.product_details || null,
        variants: value.is_variant ? variants : undefined,
        batches: value.is_batch ? batches : undefined,
        combo_items: value.type === 'combo' ? comboItems : undefined,
        initial_stock:
          !isEdit && !value.is_variant && !value.is_batch && initialStock.length > 0 ? initialStock : undefined,
        custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
        images: value.images
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: product.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Sticky-style action bar, mirrors the legacy product-create header */}
      <div className='bg-card sticky top-0 z-10 mb-6 flex items-center justify-end gap-2 rounded-lg border p-3'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton loading={isPending} type='submit'>
          <Icons.check className='mr-2 h-4 w-4' /> {isEdit ? 'Update Product' : 'Add Product'}
        </LoadingButton>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* ═══════════ MAIN COLUMN ═══════════ */}
        <div className='space-y-6 lg:col-span-2'>
          <SectionCard icon={Icons.product} title='Basic Information'>
            <form.Field name='type'>
              {(field) => (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Product Type *</label>
                  <div className='flex flex-wrap gap-2'>
                    {TYPE_PILLS.map((pill) => (
                      <button
                        key={pill.value}
                        type='button'
                        onClick={() => field.handleChange(pill.value)}
                        className={cn(
                          'rounded-full border px-4 py-1.5 text-sm transition-colors',
                          field.state.value === pill.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/40 hover:bg-muted border-input'
                        )}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>

            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <form.AppField name='name' children={(field) => <field.TextField label='Product Name' required />} />
              <form.AppField name='code' children={(field) => <field.TextField label='Product Code' required />} />
            </FieldGroup>

            <form.AppField
              name='product_details'
              children={(field) => <field.TextareaField label='Product Details' />}
            />
          </SectionCard>

          <SectionCard icon={Icons.media} title='Media' hint='First image is the base image'>
            <form.AppField
              name='images'
              children={(field) => (
                <field.FileUploadField
                  label='Images'
                  description='PNG or JPG up to 2MB each.'
                  maxSize={2 * 1024 * 1024}
                  maxFiles={10}
                />
              )}
            />
          </SectionCard>

          <SectionCard icon={Icons.billing} title='Pricing'>
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <form.AppField name='cost' children={(field) => <field.TextField label='Cost' type='number' required />} />
              <form.AppField
                name='profit_margin'
                children={(field) => <field.TextField label='Profit Margin %' type='number' />}
              />
              <form.AppField name='price' children={(field) => <field.TextField label='Price' type='number' required />} />
              <form.AppField
                name='wholesale_price'
                children={(field) => <field.TextField label='Wholesale Price' type='number' />}
              />
              <form.AppField
                name='min_wholesale_qty'
                children={(field) => <field.TextField label='Min Wholesale Qty' type='number' />}
              />
              <form.AppField name='tax_id' children={(field) => <field.SelectField label='Tax' options={taxOptions} />} />
              <form.AppField
                name='tax_method'
                children={(field) => <field.SelectField label='Tax Method' options={TAX_METHOD_OPTIONS} />}
              />
            </FieldGroup>

            <div className='border-t pt-4'>
              <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <form.AppField
                  name='starting_date'
                  children={(field) => <field.TextField label='Promotion Starts' type='date' />}
                />
                <form.AppField
                  name='last_date'
                  children={(field) => <field.TextField label='Promotion Ends' type='date' />}
                />
              </FieldGroup>
            </div>
          </SectionCard>

          <SectionCard icon={Icons.unit} title='Units'>
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <form.AppField name='unit_id' children={(field) => <field.SelectField label='Product Unit' options={unitOptions} />} />
              <form.AppField
                name='sale_unit_id'
                children={(field) => <field.SelectField label='Sale Unit' options={unitOptions} />}
              />
              <form.AppField
                name='purchase_unit_id'
                children={(field) => <field.SelectField label='Purchase Unit' options={unitOptions} />}
              />
            </FieldGroup>
          </SectionCard>

          <SectionCard icon={Icons.adjustments} title='Variants'>
            <form.AppField name='is_variant' children={(field) => <field.SwitchField label='This product has variants' />} />
            <form.Subscribe selector={(state) => state.values.is_variant}>
              {(isVariant) => isVariant && <ProductVariantsEditor rows={variants} onChange={setVariants} />}
            </form.Subscribe>
          </SectionCard>

          <SectionCard icon={Icons.warehouse} title='Inventory'>
            {!isEdit && (
              <>
                <p className='text-muted-foreground text-xs'>
                  Initial stock only applies to simple products (no variants or batches).
                </p>
                <form.Subscribe selector={(state) => [state.values.is_variant, state.values.is_batch] as const}>
                  {([isVariant, isBatch]) =>
                    !isVariant &&
                    !isBatch && (
                      <ProductInitialStockEditor
                        rows={initialStock}
                        onChange={setInitialStock}
                        warehouseOptions={warehouseOptions}
                      />
                    )
                  }
                </form.Subscribe>
              </>
            )}

            <div className='space-y-3 border-t pt-4'>
              <form.AppField name='is_batch' children={(field) => <field.SwitchField label='This product has batch and expiry date' />} />
              <form.AppField name='is_imei' children={(field) => <field.SwitchField label='This product has IMEI or serial numbers' />} />
            </div>

            <form.Subscribe selector={(state) => state.values.is_batch}>
              {(isBatch) => isBatch && <ProductBatchesEditor rows={batches} onChange={setBatches} />}
            </form.Subscribe>
          </SectionCard>

          <form.Subscribe selector={(state) => state.values.type}>
            {(type) =>
              type === 'combo' && (
                <SectionCard icon={Icons.galleryVerticalEnd} title='Combo Products'>
                  <ProductComboEditor rows={comboItems} onChange={setComboItems} componentOptions={componentOptions} />
                </SectionCard>
              )
            }
          </form.Subscribe>

          {(customFieldsData?.data.length ?? 0) > 0 && (
            <SectionCard icon={Icons.forms} title='Additional Fields'>
              <ProductCustomFieldsEditor
                customFields={customFieldsData?.data ?? []}
                values={customFieldValues}
                onChange={setCustomFieldValues}
              />
            </SectionCard>
          )}
        </div>

        {/* ═══════════ SIDEBAR ═══════════ */}
        <div className='space-y-6'>
          <SectionCard icon={Icons.category} title='Organization'>
            <form.AppField name='category_id' children={(field) => <field.SelectField label='Category' required options={categoryOptions} />} />
            <form.AppField name='brand_id' children={(field) => <field.SelectField label='Brand' options={brandOptions} />} />
          </SectionCard>

          <SectionCard icon={Icons.badgeCheck} title='Warranty & Guarantee'>
            <form.AppField name='has_warranty' children={(field) => <field.SwitchField label='Has Warranty' />} />
            <form.Subscribe selector={(state) => state.values.has_warranty}>
              {(hasWarranty) =>
                hasWarranty && (
                  <FieldGroup className='grid grid-cols-2 gap-2'>
                    <form.AppField
                      name='warranty_value'
                      children={(field) => <field.TextField label='Value' type='number' required />}
                    />
                    <form.AppField
                      name='warranty_type'
                      children={(field) => <field.SelectField label='Type' required options={DURATION_OPTIONS} />}
                    />
                  </FieldGroup>
                )
              }
            </form.Subscribe>

            <form.AppField name='has_guarantee' children={(field) => <field.SwitchField label='Has Guarantee' />} />
            <form.Subscribe selector={(state) => state.values.has_guarantee}>
              {(hasGuarantee) =>
                hasGuarantee && (
                  <FieldGroup className='grid grid-cols-2 gap-2'>
                    <form.AppField
                      name='guarantee_value'
                      children={(field) => <field.TextField label='Value' type='number' required />}
                    />
                    <form.AppField
                      name='guarantee_type'
                      children={(field) => <field.SelectField label='Type' required options={DURATION_OPTIONS} />}
                    />
                  </FieldGroup>
                )
              }
            </form.Subscribe>
          </SectionCard>

          <SectionCard icon={Icons.notification} title='Inventory Settings'>
            <form.AppField
              name='alert_quantity'
              children={(field) => <field.TextField label='Alert Quantity' type='number' />}
            />
            <form.AppField
              name='wastage_percent'
              children={(field) => <field.TextField label='Wastage %' type='number' />}
            />
          </SectionCard>
        </div>
      </div>
    </form>
  );
}
