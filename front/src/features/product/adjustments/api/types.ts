export type AdjustmentAction = '+' | '-';

export type AdjustmentItem = {
  id?: number;
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  action: AdjustmentAction;
  qty: number;
  unit_cost?: number | null;
};

export type Adjustment = {
  id: number;
  reference_no: string;
  warehouse_id: number;
  warehouse_name?: string | null;
  user_id: number | null;
  user_name?: string | null;
  total_qty: number;
  note: string | null;
  items?: AdjustmentItem[];
  created_at: string;
  updated_at: string;
};

export type AdjustmentFilters = {
  id?: string;
  reference_no?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type AdjustmentsResponse = {
  data: Adjustment[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type AdjustmentMutationPayload = {
  warehouse_id: number;
  note?: string | null;
  items: {
    product_id: number;
    variant_id?: number | null;
    batch_id?: number | null;
    action: AdjustmentAction;
    qty: number;
    unit_cost?: number | null;
  }[];
};
