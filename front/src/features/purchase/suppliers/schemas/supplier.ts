import * as z from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string(),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]),
  address: z.string()
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
