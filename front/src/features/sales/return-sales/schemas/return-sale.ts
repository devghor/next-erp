import * as z from 'zod';

export const returnSaleSchema = z.object({
  sale_id: z.string().min(1, 'Sale is required'),
  refund: z.boolean(),
  refund_amount: z.number().min(0),
  paying_method: z.string(),
  change_sale_status: z.boolean(),
  return_note: z.string(),
  staff_note: z.string()
});

export type ReturnSaleFormValues = z.infer<typeof returnSaleSchema>;
