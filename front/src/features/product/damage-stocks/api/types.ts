export type DamageStockItem = {
  id?: number;
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  qty: number;
  unit_cost?: number | null;
};

export type DamageStock = {
  id: number;
  reference_no: string;
  warehouse_id: number;
  warehouse_name?: string | null;
  user_id: number | null;
  user_name?: string | null;
  damaged_at: string;
  document_url: string | null;
  total_qty: number;
  note: string | null;
  items?: DamageStockItem[];
  created_at: string;
  updated_at: string;
};

export type DamageStockFilters = {
  id?: string;
  reference_no?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type DamageStocksResponse = {
  data: DamageStock[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type DamageStockMutationPayload = {
  warehouse_id: number;
  damaged_at: string;
  document?: File | null;
  note?: string | null;
  items: {
    product_id: number;
    variant_id?: number | null;
    batch_id?: number | null;
    qty: number;
    unit_cost?: number | null;
  }[];
};
