import * as z from 'zod';

export const NO_BASE_UNIT = 'none';

export const unitSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  base_unit_id: z.string(),
  operator: z.enum(['*', '/']),
  operation_value: z
    .number({ error: 'Operation value is required' })
    .min(0.0001, 'Must be greater than 0')
});

export type UnitFormValues = z.infer<typeof unitSchema>;
