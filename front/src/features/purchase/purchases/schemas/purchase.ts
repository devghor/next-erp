import * as z from 'zod';

export const purchaseSchema = z.object({
  supplier_id: z.string(),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  order_tax: z.number().min(0),
  paid_amount: z.number().min(0),
  paying_method: z.string(),
  note: z.string()
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export const purchaseItemSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  product_name: z.string().optional(),
  qty: z.number().min(0.0001, 'Qty must be greater than 0'),
  net_unit_cost: z.number().min(0, 'Cost must be 0 or more'),
  discount: z.number().min(0),
  tax_rate: z.number().min(0)
});

export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;
