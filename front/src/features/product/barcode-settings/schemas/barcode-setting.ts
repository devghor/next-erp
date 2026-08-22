import * as z from 'zod';

export const barcodeSettingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string(),
  width: z.number({ error: 'Width is required' }).min(0.01, 'Must be greater than 0'),
  height: z.number({ error: 'Height is required' }).min(0.01, 'Must be greater than 0'),
  paper_width: z.number().min(0),
  paper_height: z.number().min(0),
  top_margin: z.number().min(0),
  left_margin: z.number().min(0),
  row_distance: z.number().min(0),
  col_distance: z.number().min(0),
  stickers_in_one_row: z.number().min(1),
  stickers_in_one_sheet: z.number().min(1),
  is_default: z.boolean()
});

export type BarcodeSettingFormValues = z.infer<typeof barcodeSettingSchema>;
