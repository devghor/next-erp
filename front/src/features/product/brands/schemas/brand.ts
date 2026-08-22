import * as z from 'zod';

export const brandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image: z.array(z.instanceof(File))
});

export type BrandFormValues = z.infer<typeof brandSchema>;
