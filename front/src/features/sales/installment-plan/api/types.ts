export type Installment = {
  id: number;
  installment_plan_id: number;
  status: 'pending' | 'completed';
  payment_date: string;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type InstallmentPlan = {
  id: number;
  sale_id: number;
  sale_reference_no?: string | null;
  customer_name?: string | null;
  name: string;
  price: number;
  additional_amount: number;
  total_amount: number;
  down_payment: number;
  months: number;
  paid_count?: number | null;
  installments: Installment[];
  created_at: string;
  updated_at: string;
};

export type InstallmentPlanFilters = {
  page?: number;
  per_page?: number;
};

export type InstallmentPlansResponse = {
  data: InstallmentPlan[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type PayInstallmentPayload = {
  amount?: number;
  paying_method?: string;
  account_id?: number | null;
  cheque_no?: string;
  payment_note?: string;
};
