export type PrintBarcodeProductRow = {
  product_id: number;
  code: string;
  name: string;
  price: number;
  brand_name: string | null;
  qty: number;
};

export type PrintOptions = {
  name: boolean;
  name_size: number;
  price: boolean;
  price_size: number;
  business_name: boolean;
  business_name_size: number;
  brand_name: boolean;
  brand_name_size: number;
};

export type PrintBarcodesPayload = {
  barcode_setting_id: number;
  products: { product_id: number; qty: number }[];
  print: PrintOptions;
};
