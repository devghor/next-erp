export type CourierType = 'steadfast' | 'pathao' | 'manual';

export type Courier = {
  id: number;
  name: string;
  type: CourierType;
  phone_number: string | null;
  address: string | null;
  api_key: string | null;
  secret_key: string | null;
  client_id: string | null;
  client_secret: string | null;
  username: string | null;
  password: string | null;
  base_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CourierFilters = {
  id?: string;
  name?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type CouriersResponse = {
  data: Courier[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CourierMutationPayload = {
  name: string;
  type: CourierType;
  phone_number?: string | null;
  address?: string | null;
  api_key?: string | null;
  secret_key?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  username?: string | null;
  password?: string | null;
  base_url?: string | null;
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
