export type Category = {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryFilters = {
  id?: string;
  name?: string;
  parent_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type CategoriesResponse = {
  data: Category[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CategoryMutationPayload = {
  name: string;
  parent_id: number | null;
  image?: File | null;
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
