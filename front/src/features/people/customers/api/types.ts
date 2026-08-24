export type Customer = {
  id: number;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  tax_number: string | null;
  credit_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerFilters = {
  id?: string;
  name?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_number?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type CustomersResponse = {
  data: Customer[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CustomerMutationPayload = {
  name: string;
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  tax_number?: string | null;
  credit_limit?: number | null;
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
