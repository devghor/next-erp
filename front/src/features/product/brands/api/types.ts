export type Brand = {
  id: number;
  name: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BrandFilters = {
  id?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type BrandsResponse = {
  data: Brand[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type BrandMutationPayload = {
  name: string;
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
