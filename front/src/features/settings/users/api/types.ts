export type User = {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
};

export type UserFilters = {
  id?: string;
  name?: string;
  email?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type UsersResponse = {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type UserMutationPayload = {
  name: string;
  email: string;
  password?: string;
  profile_picture?: File | null;
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
