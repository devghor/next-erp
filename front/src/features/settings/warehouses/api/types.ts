export type Warehouse = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WarehouseFilters = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type WarehousesResponse = {
  data: Warehouse[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type WarehouseMutationPayload = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
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
