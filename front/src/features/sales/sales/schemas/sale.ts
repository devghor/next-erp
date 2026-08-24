import * as z from 'zod';

export const saleSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  biller_id: z.string(),
  currency_id: z.string(),
  sale_status: z.enum(['draft', 'completed']),
  order_tax_rate: z.number().min(0),
  order_discount_type: z.enum(['fixed', 'percentage']),
  order_discount_value: z.number().min(0),
  shipping_cost: z.number().min(0),
  sale_note: z.string(),
  staff_note: z.string(),
  enable_installment: z.boolean(),
  installment_name: z.string(),
  installment_price: z.number().min(0),
  installment_additional_amount: z.number().min(0),
  installment_down_payment: z.number().min(0),
  installment_months: z.number().min(1)
});

export type SaleFormValues = z.infer<typeof saleSchema>;

export const saleItemSchema = z.object({
  product_id: z.number().min(1, 'Product is required'),
  product_name: z.string().optional(),
  qty: z.number().min(0.0001, 'Qty must be greater than 0'),
  net_unit_price: z.number().min(0, 'Price must be 0 or more'),
  discount: z.number().min(0),
  tax_rate: z.number().min(0)
});

export type SaleItemFormValues = z.infer<typeof saleItemSchema>;

export const salePaymentRowSchema = z.object({
  paying_method: z.string().min(1),
  amount: z.number().min(0),
  account_id: z.number().nullable().optional(),
  cheque_no: z.string().optional()
});

export type SalePaymentRowValues = z.infer<typeof salePaymentRowSchema>;
