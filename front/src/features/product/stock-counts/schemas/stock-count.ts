import * as z from 'zod';

export const stockCountCreateSchema = z.object({
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  category_id: z.string(),
  brand_id: z.string(),
  note: z.string()
});

export type StockCountCreateFormValues = z.infer<typeof stockCountCreateSchema>;
