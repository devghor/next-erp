export type Tax = {
  id: number;
  name: string;
  rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TaxFilters = {
  id?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type TaxesResponse = {
  data: Tax[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type TaxMutationPayload = {
  name: string;
  rate: number;
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
