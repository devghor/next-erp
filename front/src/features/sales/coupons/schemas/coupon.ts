import * as z from 'zod';

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(50),
  name: z.string().max(255),
  type: z.enum(['fixed', 'percentage']),
  amount: z.number({ error: 'Amount is required' }).min(0, 'Must be 0 or greater'),
  minimum_amount: z.number().min(0),
  quantity: z.number({ error: 'Quantity is required' }).int().min(0),
  expired_date: z.date({ error: 'Expiry date is required' })
});

export type CouponFormValues = z.infer<typeof couponSchema>;
