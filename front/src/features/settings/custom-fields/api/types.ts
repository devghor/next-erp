export type CustomFieldType = 'text' | 'number' | 'select' | 'checkbox' | 'multi_select' | 'date';

export type CustomField = {
  id: number;
  belongs_to: string;
  name: string;
  type: CustomFieldType;
  options: string[] | null;
  is_table: boolean;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomFieldFilters = {
  id?: string;
  belongs_to?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type CustomFieldsResponse = {
  data: CustomField[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CustomFieldMutationPayload = {
  belongs_to: string;
  name: string;
  type: CustomFieldType;
  options?: string[] | null;
  is_table: boolean;
  is_required: boolean;
};
