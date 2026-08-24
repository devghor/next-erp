import * as z from 'zod';

export const deliverySchema = z.object({
  sale_id: z.string().min(1, 'Sale is required'),
  courier_id: z.string(),
  address: z.string(),
  delivered_by: z.string(),
  recieved_by: z.string(),
  note: z.string()
});

export type DeliveryFormValues = z.infer<typeof deliverySchema>;
