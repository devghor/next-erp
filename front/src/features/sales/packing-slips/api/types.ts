export type PackingSlipProduct = {
  id: number;
  product_id: number;
  product_name?: string | null;
  variant_id: number | null;
  variant_name?: string | null;
};

export type PackingSlip = {
  id: number;
  reference_no: string;
  sale_id: number;
  sale_reference_no?: string | null;
  customer_name?: string | null;
  delivery_id: number | null;
  amount: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  products: PackingSlipProduct[];
  created_at: string;
  updated_at: string;
};

export type PackingSlipFilters = {
  reference_no?: string;
  sale_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
};

export type PackingSlipsResponse = {
  data: PackingSlip[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type AvailableSaleLine = {
  id: number;
  product_id: number;
  product_name: string | null;
  variant_id: number | null;
  variant_name: string | null;
  qty: number;
  net_unit_price: number;
  total: number;
};

export type PackingSlipMutationPayload = {
  sale_id: number;
  lines: Array<{
    product_sale_id: number;
    product_id: number;
    variant_id?: number | null;
  }>;
};
