export type PurchaseItem = {
  id?: number;
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  purchase_unit_id?: number | null;
  qty: number;
  received?: number;
  net_unit_cost: number;
  discount?: number;
  tax_rate?: number;
  tax?: number;
  total?: number;
};

export type Purchase = {
  id: number;
  reference_no: string;
  supplier_id: number | null;
  supplier_name?: string | null;
  warehouse_id: number;
  warehouse_name?: string | null;
  status: 'pending' | 'received';
  payment_status: 'paid' | 'partial' | 'due';
  total_qty: number;
  total_discount: number;
  total_tax: number;
  total_cost: number;
  order_tax: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  note: string | null;
  items?: PurchaseItem[];
  created_at: string;
  updated_at: string;
};

export type PurchaseFilters = {
  id?: string;
  reference_no?: string;
  supplier_id?: string;
  warehouse_id?: string;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type PurchasesResponse = {
  data: Purchase[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type PurchaseMutationPayload = {
  supplier_id?: number | null;
  warehouse_id: number;
  order_tax?: number;
  paid_amount?: number;
  paying_method?: string;
  note?: string | null;
  items: {
    product_id: number;
    variant_id?: number | null;
    batch_id?: number | null;
    purchase_unit_id?: number | null;
    qty: number;
    net_unit_cost: number;
    discount?: number;
    tax_rate?: number;
  }[];
};
