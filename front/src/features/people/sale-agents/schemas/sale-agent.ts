import * as z from 'zod';

export const saleAgentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string(),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]),
  address: z.string(),
  commission_rate: z
    .number({ error: 'Commission rate is required' })
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less')
});

export type SaleAgentFormValues = z.infer<typeof saleAgentSchema>;
