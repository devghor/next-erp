import * as z from 'zod';

export const damageStockSchema = z.object({
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  damaged_at: z.string().min(1, 'Date is required'),
  note: z.string()
});

export type DamageStockFormValues = z.infer<typeof damageStockSchema>;

export const damageStockItemSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  product_name: z.string().optional(),
  qty: z.number().min(0.0001, 'Qty must be greater than 0'),
  unit_cost: z.number().min(0).optional()
});

export type DamageStockItemFormValues = z.infer<typeof damageStockItemSchema>;
