import * as z from 'zod';

export const productSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(1, 'Code is required'),
    type: z.enum(['standard', 'combo', 'digital', 'service']),
    category_id: z.string().min(1, 'Category is required'),
    brand_id: z.string(),
    unit_id: z.string(),
    purchase_unit_id: z.string(),
    sale_unit_id: z.string(),
    tax_id: z.string(),
    cost: z.number().min(0),
    price: z.number().min(0),
    wholesale_price: z.number().min(0),
    min_wholesale_qty: z.number().min(0),
    tax_method: z.enum(['1', '2']),
    alert_quantity: z.number().min(0),
    has_warranty: z.boolean(),
    warranty_value: z.number().min(0),
    warranty_type: z.string(),
    has_guarantee: z.boolean(),
    guarantee_value: z.number().min(0),
    guarantee_type: z.string(),
    starting_date: z.string(),
    last_date: z.string(),
    is_variant: z.boolean(),
    is_imei: z.boolean(),
    is_batch: z.boolean(),
    is_recipe: z.boolean(),
    wastage_percent: z.number().min(0).max(100),
    profit_margin: z.number().min(0).max(100),
    product_details: z.string(),
    images: z.array(z.instanceof(File))
  })
  .refine((data) => !data.has_warranty || (!!data.warranty_value && !!data.warranty_type), {
    message: 'Warranty value and type are required when warranty is enabled',
    path: ['warranty_value']
  })
  .refine((data) => !data.has_guarantee || (!!data.guarantee_value && !!data.guarantee_type), {
    message: 'Guarantee value and type are required when guarantee is enabled',
    path: ['guarantee_value']
  });

export type ProductFormValues = z.infer<typeof productSchema>;

export const variantRowSchema = z.object({
  name: z.string().min(1, 'Required'),
  item_code: z.string().min(1, 'Required'),
  additional_cost: z.number().min(0).default(0),
  additional_price: z.number().min(0).default(0)
});
export type VariantRowValues = z.infer<typeof variantRowSchema>;

export const batchRowSchema = z.object({
  batch_no: z.string().min(1, 'Required'),
  expired_date: z.string().optional()
});
export type BatchRowValues = z.infer<typeof batchRowSchema>;

export const comboRowSchema = z.object({
  component_product_id: z.number().min(1, 'Required'),
  component_product_name: z.string().optional(),
  qty: z.number().min(0.0001, 'Must be > 0'),
  unit_price: z.number().min(0).default(0),
  wastage_percent: z.number().min(0).max(100).default(0)
});
export type ComboRowValues = z.infer<typeof comboRowSchema>;

export const initialStockRowSchema = z.object({
  warehouse_id: z.number().min(1, 'Required'),
  warehouse_name: z.string().optional(),
  qty: z.number().min(0)
});
export type InitialStockRowValues = z.infer<typeof initialStockRowSchema>;
