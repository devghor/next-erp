import * as z from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string(),
  phone: z.string(),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  tax_number: z.string(),
  credit_limit: z.number({ error: 'Credit limit is required' }).min(0, 'Must be 0 or greater')
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
