import * as z from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  parent_id: z.string(),
  image: z.array(z.instanceof(File))
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
