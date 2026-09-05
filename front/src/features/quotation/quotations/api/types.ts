export type QuotationItem = {
  id?: number;
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  quotation_unit_id?: number | null;
  qty: number;
  net_unit_price: number;
  discount?: number;
  tax_rate?: number;
  tax?: number;
  total?: number;
};

export type Quotation = {
  id: number;
  reference_no: string;
  customer_id: number;
  customer_name?: string | null;
  warehouse_id: number;
  warehouse_name?: string | null;
  biller_id: number | null;
  biller_name?: string | null;
  supplier_id: number | null;
  supplier_name?: string | null;
  item: number;
  total_qty: number;
  total_discount: number;
  total_tax: number;
  total_price: number;
  order_tax_rate: number | null;
  order_tax: number;
  order_discount: number;
  shipping_cost: number;
  grand_total: number;
  quotation_status: 'pending' | 'sent';
  document_url: string | null;
  note: string | null;
  items?: QuotationItem[];
  created_at: string;
  updated_at: string;
};

export type QuotationFilters = {
  id?: string;
  reference_no?: string;
  customer_id?: string;
  warehouse_id?: string;
  quotation_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type QuotationsResponse = {
  data: Quotation[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type QuotationMutationPayload = {
  customer_id: number;
  warehouse_id: number;
  biller_id?: number | null;
  supplier_id?: number | null;
  order_tax_rate?: number;
  order_tax?: number;
  order_discount?: number;
  shipping_cost?: number;
  quotation_status?: 'pending' | 'sent';
  document?: File | null;
  note?: string | null;
  items: {
    product_id: number;
    variant_id?: number | null;
    batch_id?: number | null;
    quotation_unit_id?: number | null;
    qty: number;
    net_unit_price: number;
    discount?: number;
    tax_rate?: number;
  }[];
};
