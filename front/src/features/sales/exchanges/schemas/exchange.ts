import * as z from 'zod';

export const exchangeSchema = z.object({
  sale_reference_no: z.string(),
  customer_id: z.string().min(1, 'Customer is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  biller_id: z.string(),
  payment_type: z.string(),
  amount: z.number().min(0),
  exchange_note: z.string(),
  staff_note: z.string()
});

export type ExchangeFormValues = z.infer<typeof exchangeSchema>;

export const exchangeLineSchema = z.object({
  type: z.enum(['new', 'returned']),
  product_id: z.number().min(1, 'Product is required'),
  product_name: z.string().optional(),
  product_sale_id: z.number().nullable().optional(),
  variant_id: z.number().nullable().optional(),
  batch_id: z.number().nullable().optional(),
  qty: z.number().min(0.0001, 'Qty must be greater than 0'),
  net_unit_price: z.number().min(0, 'Price must be 0 or more'),
  discount: z.number().min(0),
  tax_rate: z.number().min(0)
});

export type ExchangeLineFormValues = z.infer<typeof exchangeLineSchema>;
