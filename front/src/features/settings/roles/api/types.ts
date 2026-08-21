export type Permission = {
  id: number;
  name: string;
  label: string | null;
  module: string | null;
  group: string | null;
};

export type PermissionGroup = {
  group: string;
  module: string | null;
  permissions: Permission[];
};

export type PermissionGroupsResponse = {
  data: PermissionGroup[];
};

export type Role = {
  id: number;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
};

export type RoleFilters = {
  id?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type RolesResponse = {
  data: Role[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type RoleMutationPayload = {
  name: string;
  permissions: string[];
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
