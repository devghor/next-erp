export type ExchangeLine = {
  id?: number;
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  sale_unit_id?: number | null;
  product_sale_id?: number | null;
  qty: number;
  net_unit_price: number;
  discount?: number;
  tax_rate?: number;
  tax?: number;
  total?: number;
  type: 'new' | 'returned';
};

export type SaleExchange = {
  id: number;
  reference_no: string;
  sale_id: number | null;
  sale_reference_no?: string | null;
  customer_id: number;
  customer_name?: string | null;
  warehouse_id: number;
  warehouse_name?: string | null;
  biller_id: number | null;
  biller_name?: string | null;
  user_id: number | null;
  item: number;
  total_qty: number;
  total_discount: number;
  total_tax: number;
  amount: number;
  payment_type: 'pay' | 'receive' | null;
  order_tax_rate: number | null;
  order_tax: number;
  grand_total: number;
  document: string | null;
  exchange_note: string | null;
  staff_note: string | null;
  new_products?: ExchangeLine[];
  returned_products?: ExchangeLine[];
  created_at: string;
  updated_at: string;
};

export type SaleExchangeFilters = {
  warehouse_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type SaleExchangesResponse = {
  data: SaleExchange[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type SaleExchangeMutationPayload = {
  sale_id?: number | null;
  customer_id: number;
  warehouse_id: number;
  biller_id?: number | null;
  payment_type?: 'pay' | 'receive' | null;
  amount?: number;
  account_id?: number | null;
  exchange_note?: string | null;
  staff_note?: string | null;
  lines: {
    type: 'new' | 'returned';
    product_id: number;
    variant_id?: number | null;
    batch_id?: number | null;
    sale_unit_id?: number | null;
    product_sale_id?: number | null;
    qty: number;
    net_unit_price: number;
    discount?: number;
    tax_rate?: number;
  }[];
};
