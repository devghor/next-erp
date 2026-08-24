import * as z from 'zod';

export const giftCardSchema = z.object({
  card_no: z.string().min(2, 'Card number must be at least 2 characters'),
  amount: z.number({ error: 'Amount is required' }).min(0, 'Must be 0 or greater'),
  customer_id: z.string(),
  expired_date: z.string()
});

export type GiftCardFormValues = z.infer<typeof giftCardSchema>;

export const rechargeSchema = z.object({
  amount: z.number({ error: 'Amount is required' }).min(0.01, 'Must be greater than 0')
});

export type RechargeFormValues = z.infer<typeof rechargeSchema>;
