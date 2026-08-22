import * as z from 'zod';

export const currencySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required').max(10, 'Code must be at most 10 characters'),
  symbol: z.string(),
  exchange_rate: z.number({ error: 'Exchange rate is required' }).min(0, 'Must be 0 or greater')
});

export type CurrencyFormValues = z.infer<typeof currencySchema>;
