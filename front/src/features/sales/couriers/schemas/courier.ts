import * as z from 'zod';

export const courierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['steadfast', 'pathao', 'manual']),
  phone_number: z.string(),
  address: z.string(),
  api_key: z.string(),
  secret_key: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
  username: z.string(),
  password: z.string(),
  base_url: z.string()
});

export type CourierFormValues = z.infer<typeof courierSchema>;
