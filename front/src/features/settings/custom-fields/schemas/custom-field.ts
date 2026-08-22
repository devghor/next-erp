import * as z from 'zod';

const OPTION_TYPES = ['select', 'checkbox', 'multi_select'] as const;

export const customFieldSchema = z
  .object({
    belongs_to: z.string().min(1, 'Belongs to is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.enum(['text', 'number', 'select', 'checkbox', 'multi_select', 'date']),
    options: z.array(z.string().min(1)),
    is_table: z.boolean(),
    is_required: z.boolean()
  })
  .refine(
    (value) => !OPTION_TYPES.includes(value.type as (typeof OPTION_TYPES)[number]) || value.options.length > 0,
    { message: 'Add at least one option for this field type', path: ['options'] }
  );

export type CustomFieldFormValues = z.infer<typeof customFieldSchema>;
