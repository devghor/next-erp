import * as z from 'zod';

export const quotationSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  biller_id: z.string(),
  supplier_id: z.string(),
  order_tax_rate: z.number().min(0),
  order_tax: z.number().min(0),
  order_discount: z.number().min(0),
  shipping_cost: z.number().min(0),
  quotation_status: z.enum(['pending', 'sent']),
  note: z.string()
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;

export const quotationItemSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  product_name: z.string().optional(),
  qty: z.number().min(0.0001, 'Qty must be greater than 0'),
  net_unit_price: z.number().min(0, 'Price must be 0 or more'),
  discount: z.number().min(0),
  tax_rate: z.number().min(0)
});

export type QuotationItemFormValues = z.infer<typeof quotationItemSchema>;
