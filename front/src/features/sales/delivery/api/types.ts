export type DeliveryStatus = 'packing' | 'delivering' | 'delivered';

export type Delivery = {
  id: number;
  reference_no: string;
  sale_id: number;
  sale_reference_no?: string | null;
  customer_name?: string | null;
  courier_id: number | null;
  courier_name?: string | null;
  courier_type?: string | null;
  user_id: number | null;
  user_name?: string | null;
  address: string | null;
  tracking_code: string | null;
  delivered_by: string | null;
  recieved_by: string | null;
  note: string | null;
  status: DeliveryStatus;
  created_at: string;
  updated_at: string;
};

export type DeliveryFilters = {
  id?: string;
  reference_no?: string;
  sale_id?: string;
  courier_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type DeliveriesResponse = {
  data: Delivery[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type DeliveryMutationPayload = {
  sale_id: number;
  courier_id?: number | null;
  address?: string | null;
  delivered_by?: string | null;
  recieved_by?: string | null;
  note?: string | null;
};

export type DeliveryUpdatePayload = {
  courier_id?: number | null;
  address?: string | null;
  delivered_by?: string | null;
  recieved_by?: string | null;
  note?: string | null;
  status?: DeliveryStatus;
};
