export type Unit = {
  id: number;
  code: string;
  name: string;
  base_unit_id: number | null;
  base_unit_name: string | null;
  operator: '*' | '/';
  operation_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UnitFilters = {
  id?: string;
  code?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type UnitsResponse = {
  data: Unit[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type UnitMutationPayload = {
  code: string;
  name: string;
  base_unit_id: number | null;
  operator: '*' | '/';
  operation_value: number;
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
