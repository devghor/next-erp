import * as z from 'zod';

export const adjustmentSchema = z.object({
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  note: z.string()
});

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export const adjustmentItemSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  product_name: z.string().optional(),
  action: z.enum(['+', '-']),
  qty: z.number().min(0.0001, 'Qty must be greater than 0'),
  unit_cost: z.number().min(0).optional()
});

export type AdjustmentItemFormValues = z.infer<typeof adjustmentItemSchema>;
