import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profile_picture: z.array(z.instanceof(File))
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.union([z.string().min(8, 'Password must be at least 8 characters'), z.literal('')]),
  profile_picture: z.array(z.instanceof(File))
});

export type UserFormValues = z.infer<typeof createUserSchema>;
