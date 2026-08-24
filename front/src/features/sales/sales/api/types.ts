export type SalePayment = {
  id: number;
  payment_reference: string;
  amount: number;
  paying_method: string;
  account_id: number | null;
  created_at: string;
};

export type SaleItem = {
  id?: number;
  product_id: number;
  product_name?: string;
  variant_id?: number | null;
  batch_id?: number | null;
  sale_unit_id?: number | null;
  qty: number;
  return_qty?: number;
  net_unit_price: number;
  discount?: number;
  tax_rate?: number;
  tax?: number;
  total?: number;
  is_packing?: boolean;
  is_delivered?: boolean;
};

export type Sale = {
  id: number;
  reference_no: string;
  customer_id: number;
  customer_name?: string | null;
  warehouse_id: number;
  warehouse_name?: string | null;
  biller_id: number | null;
  biller_name?: string | null;
  currency_id: number | null;
  exchange_rate: number;
  item: number;
  total_qty: number;
  total_discount: number;
  total_tax: number;
  total_price: number;
  order_tax_rate: number | null;
  order_tax: number;
  order_discount_type: 'fixed' | 'percentage';
  order_discount_value: number;
  order_discount: number;
  coupon_id: number | null;
  coupon_discount: number;
  shipping_cost: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  sale_status: 'draft' | 'completed';
  payment_status: 'due' | 'partial' | 'paid';
  pay_term_no: number | null;
  pay_term_period: 'days' | 'months' | null;
  due_date: string | null;
  document: string | null;
  sale_note: string | null;
  staff_note: string | null;
  items?: SaleItem[];
  payments?: SalePayment[];
  created_at: string;
  updated_at: string;
};

export type SaleFilters = {
  id?: string;
  reference_no?: string;
  customer_id?: string;
  warehouse_id?: string;
  sale_status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type SalesResponse = {
  data: Sale[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type SalePaymentInput = {
  paying_method: string;
  amount: number;
  account_id?: number | null;
  gift_card_id?: number | null;
  cheque_no?: string | null;
  payment_note?: string | null;
  /** Set on a payment gateway row (Stripe/Razorpay/M-Pesa/MTN MoMo/PayHere) — the gateway's own transaction id for this payment. */
  gateway_reference?: string | null;
  /** Set alongside `gateway_reference` — the gateway's status string at the moment the payment row was added (e.g. `succeeded`, `completed`). */
  gateway_status?: string | null;
};

export type SaleMutationPayload = {
  customer_id: number;
  warehouse_id: number;
  biller_id?: number | null;
  currency_id?: number | null;
  exchange_rate?: number;
  sale_status?: 'draft' | 'completed';
  order_tax_rate?: number | null;
  order_discount_type?: 'fixed' | 'percentage';
  order_discount_value?: number;
  coupon_id?: number | null;
  shipping_cost?: number;
  pay_term_no?: number | null;
  pay_term_period?: 'days' | 'months' | null;
  due_date?: string | null;
  sale_note?: string | null;
  staff_note?: string | null;
  /** POS-originated sale flag — lets "today sale"/"recent transactions" filter to POS sales. */
  is_pos?: boolean;
  /** Ties the sale to the register session that rang it up. */
  cash_register_id?: number | null;
  /** Offline-queue idempotency key — unique per company, prevents double-insert on retried sync. */
  client_reference?: string | null;
  items: {
    product_id: number;
    variant_id?: number | null;
    batch_id?: number | null;
    sale_unit_id?: number | null;
    qty: number;
    net_unit_price: number;
    discount?: number;
    tax_rate?: number;
  }[];
  payments?: SalePaymentInput[];
  installment?: {
    name: string;
    price: number;
    additional_amount?: number;
    down_payment?: number;
    months: number;
  } | null;
};

export type SaleCsvImportPayload = {
  file: File;
  customer_id: number;
  warehouse_id: number;
  biller_id?: number | null;
  currency_id?: number | null;
  sale_status?: 'draft' | 'completed';
};
