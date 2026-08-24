export type StockCountStatus = 'draft' | 'counted' | 'adjusted';
export type StockCountType = 'full' | 'partial';

export type StockCountItem = {
  id: number;
  product_id: number;
  product_name?: string;
  product_code?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  expected_qty: number;
  counted_qty: number | null;
  difference: number | null;
  unit_cost: number | null;
};

export type StockCount = {
  id: number;
  reference_no: string;
  warehouse_id: number;
  warehouse_name?: string | null;
  user_id: number | null;
  user_name?: string | null;
  adjustment_id: number | null;
  type: StockCountType;
  status: StockCountStatus;
  category_ids: number[] | null;
  brand_ids: number[] | null;
  note: string | null;
  items?: StockCountItem[];
  created_at: string;
  updated_at: string;
};

export type StockCountFilters = {
  id?: string;
  reference_no?: string;
  warehouse_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type StockCountsResponse = {
  data: StockCount[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type StockCountCreatePayload = {
  warehouse_id: number;
  category_ids?: number[] | null;
  brand_ids?: number[] | null;
  note?: string | null;
};

export type StockCountUpdatePayload = {
  note?: string | null;
};

export type StockCountSubmitPayload = {
  items: { id: number; counted_qty: number }[];
};
