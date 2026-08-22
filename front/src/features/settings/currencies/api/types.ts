export type Currency = {
  id: number;
  name: string;
  code: string;
  symbol: string | null;
  exchange_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CurrencyFilters = {
  id?: string;
  name?: string;
  code?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type CurrenciesResponse = {
  data: Currency[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CurrencyMutationPayload = {
  name: string;
  code: string;
  symbol?: string | null;
  exchange_rate: number;
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
