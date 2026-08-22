export type BarcodeSetting = {
  id: number;
  name: string;
  description: string | null;
  width: number;
  height: number;
  paper_width: number | null;
  paper_height: number | null;
  top_margin: number;
  left_margin: number;
  row_distance: number;
  col_distance: number;
  stickers_in_one_row: number;
  stickers_in_one_sheet: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type BarcodeSettingFilters = {
  name?: string;
  page?: number;
  per_page?: number;
};

export type BarcodeSettingsResponse = {
  data: BarcodeSetting[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type BarcodeSettingMutationPayload = {
  name: string;
  description?: string | null;
  width: number;
  height: number;
  paper_width?: number | null;
  paper_height?: number | null;
  top_margin?: number;
  left_margin?: number;
  row_distance?: number;
  col_distance?: number;
  stickers_in_one_row?: number;
  stickers_in_one_sheet?: number;
  is_default?: boolean;
};
