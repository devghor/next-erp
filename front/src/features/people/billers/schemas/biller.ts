import * as z from 'zod';

export const billerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string(),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  vat_number: z.string()
});

export type BillerFormValues = z.infer<typeof billerSchema>;
