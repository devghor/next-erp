export type ProductType = 'standard' | 'combo' | 'digital' | 'service';

export type ProductVariantRow = {
  id?: number;
  variant_id?: number;
  name: string;
  item_code: string;
  additional_cost: number;
  additional_price: number;
  position?: number;
};

export type ProductBatchRow = {
  id?: number;
  batch_no: string;
  expired_date?: string | null;
};

export type ProductComboItemRow = {
  id?: number;
  component_product_id: number;
  component_product_name?: string;
  component_variant_id?: number | null;
  unit_id?: number | null;
  qty: number;
  unit_price: number;
  wastage_percent?: number;
};

export type ProductInitialStockRow = {
  warehouse_id: number;
  qty: number;
};

export type Product = {
  id: number;
  name: string;
  code: string;
  type: ProductType;

  category_id: number;
  category_name?: string | null;
  brand_id: number | null;
  brand_name?: string | null;
  unit_id: number | null;
  unit_name?: string | null;
  purchase_unit_id: number | null;
  sale_unit_id: number | null;
  tax_id: number | null;
  tax_name?: string | null;

  cost: number;
  price: number;
  wholesale_price: number | null;
  min_wholesale_qty: number | null;
  tax_method: 1 | 2;
  alert_quantity: number;

  has_warranty: boolean;
  warranty_value: number | null;
  warranty_type: 'days' | 'months' | 'years' | null;
  has_guarantee: boolean;
  guarantee_value: number | null;
  guarantee_type: 'days' | 'months' | 'years' | null;

  starting_date: string | null;
  last_date: string | null;

  is_variant: boolean;
  is_imei: boolean;
  is_batch: boolean;
  is_recipe: boolean;

  wastage_percent: number | null;
  profit_margin: number | null;
  product_details: string | null;
  is_active: boolean;

  images: string[];
  variants?: ProductVariantRow[];
  batches?: ProductBatchRow[];
  combo_items?: ProductComboItemRow[];

  stock: number;
  average_cost: number;

  created_at: string;
  updated_at: string;
};

export type ProductFilters = {
  id?: string;
  name?: string;
  category_id?: string;
  brand_id?: string;
  unit_id?: string;
  tax_id?: string;
  type?: string;
  stock_filter?: 'with' | 'without' | 'all';
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type ProductsResponse = {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type ProductMutationPayload = {
  name: string;
  code: string;
  type: ProductType;
  category_id: number;
  brand_id?: number | null;
  unit_id?: number | null;
  purchase_unit_id?: number | null;
  sale_unit_id?: number | null;
  tax_id?: number | null;
  cost: number;
  price: number;
  wholesale_price?: number | null;
  min_wholesale_qty?: number | null;
  tax_method?: 1 | 2;
  alert_quantity?: number;
  has_warranty?: boolean;
  warranty_value?: number | null;
  warranty_type?: string | null;
  has_guarantee?: boolean;
  guarantee_value?: number | null;
  guarantee_type?: string | null;
  starting_date?: string | null;
  last_date?: string | null;
  is_variant?: boolean;
  is_imei?: boolean;
  is_batch?: boolean;
  is_recipe?: boolean;
  wastage_percent?: number | null;
  profit_margin?: number | null;
  product_details?: string | null;
  variants?: {
    name: string;
    item_code: string;
    additional_cost?: number;
    additional_price?: number;
  }[];
  batches?: { batch_no: string; expired_date?: string | null }[];
  combo_items?: {
    component_product_id: number;
    component_variant_id?: number | null;
    unit_id?: number | null;
    qty: number;
    unit_price?: number;
    wastage_percent?: number;
  }[];
  initial_stock?: ProductInitialStockRow[];
  custom_fields?: Record<string, string>;
  images?: File[];
};

export type ImportFailure = {
  row: number;
  attribute: string;
  errors: string[];
};

export type ImportResult = {
  imported: number;
  failures: ImportFailure[];
};

export type ProductHistory = {
  purchase_history: {
    purchase_id: number;
    reference_no: string | null;
    date: string | null;
    warehouse: string | null;
    supplier: string;
    qty: number;
    net_unit_cost: number;
    total: number;
  }[];
  adjustment_history: {
    adjustment_id: number;
    reference_no: string | null;
    date: string | null;
    warehouse: string | null;
    action: '+' | '-';
    qty: number;
    unit_cost: number | null;
  }[];
  stock_by_warehouse: { warehouse: string | null; qty: number }[];
  total_stock: number;
  average_cost: number;
};
