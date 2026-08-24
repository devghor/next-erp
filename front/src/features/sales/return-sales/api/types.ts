export type SaleReturnProductLine = {
  id: number;
  product_sale_id: number;
  product_id: number;
  product_name?: string | null;
  variant_id: number | null;
  sale_unit_id: number | null;
  qty: number;
  net_unit_price: number;
  discount: number;
  tax_rate: number;
  tax: number;
  total: number;
};

export type SaleReturn = {
  id: number;
  reference_no: string;
  sale_id: number;
  sale_reference_no?: string | null;
  customer_id: number;
  customer_name?: string | null;
  warehouse_id: number;
  warehouse_name?: string | null;
  biller_id: number | null;
  biller_name?: string | null;
  account_id: number | null;
  currency_id: number | null;
  exchange_rate: number;
  item: number;
  total_qty: number;
  total_discount: number;
  total_tax: number;
  total_price: number;
  grand_total: number;
  refund_amount: number;
  change_sale_status: boolean;
  document: string | null;
  return_note: string | null;
  staff_note: string | null;
  products?: SaleReturnProductLine[];
  created_at: string;
  updated_at: string;
};

export type SaleReturnFilters = {
  id?: string;
  reference_no?: string;
  sale_id?: string;
  customer_id?: string;
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type SaleReturnsResponse = {
  data: SaleReturn[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type AvailableReturnLine = {
  id: number;
  product_id: number;
  product_name: string | null;
  variant_id: number | null;
  variant_name: string | null;
  batch_id: number | null;
  sale_unit_id: number | null;
  qty: number;
  return_qty: number;
  returnable_qty: number;
  net_unit_price: number;
  discount: number;
  tax_rate: number;
};

export type SaleReturnMutationPayload = {
  sale_id: number;
  lines: { product_sale_id: number; qty: number }[];
  refund?: boolean;
  refund_amount?: number | null;
  account_id?: number | null;
  paying_method?: string;
  change_sale_status?: boolean;
  return_note?: string;
  staff_note?: string;
};
