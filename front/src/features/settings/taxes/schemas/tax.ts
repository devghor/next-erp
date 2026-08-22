import * as z from 'zod';

export const taxSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rate: z
    .number({ error: 'Rate is required' })
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less')
});

export type TaxFormValues = z.infer<typeof taxSchema>;
