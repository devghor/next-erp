export type Coupon = {
  id: number;
  code: string;
  name: string | null;
  type: 'fixed' | 'percentage';
  amount: number;
  minimum_amount: number;
  quantity: number;
  used: number;
  expired_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponFilters = {
  id?: string;
  code?: string;
  type?: string;
  is_active?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type CouponsResponse = {
  data: Coupon[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CouponMutationPayload = {
  code: string;
  name?: string | null;
  type: 'fixed' | 'percentage';
  amount: number;
  minimum_amount?: number;
  quantity: number;
  expired_date: string;
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
