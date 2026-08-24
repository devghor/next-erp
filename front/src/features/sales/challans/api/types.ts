export type ChallanPackingSlip = {
  id: number;
  challan_id: number;
  packing_slip_id: number;
  packing_slip_reference_no?: string | null;
  sale_reference_no?: string | null;
  customer_name?: string | null;
  sale_grand_total?: number | null;
  sale_due?: number | null;
  amount: number;
  delivery_charge: number;
  paid_amount: number;
  status: 'pending' | 'delivered' | 'cancelled';
};

export type Challan = {
  id: number;
  reference_no: string;
  courier_id: number | null;
  courier_name?: string | null;
  status: 'active' | 'close';
  closing_date: string | null;
  created_by_name?: string | null;
  closed_by_name?: string | null;
  total_amount: number;
  total_due: number;
  packing_slips: ChallanPackingSlip[];
  created_at: string;
  updated_at: string;
};

export type AvailablePackingSlip = {
  id: number;
  reference_no: string;
  sale_reference_no?: string | null;
  customer_name?: string | null;
  amount: number;
};

export type ChallanFilters = {
  status?: string;
  courier_id?: string;
  page?: number;
  per_page?: number;
};

export type ChallansResponse = {
  data: Challan[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CreateChallanPayload = {
  courier_id?: number | null;
  packing_slip_ids: number[];
};

export type FinalizeChallanPayload = {
  payments: {
    challan_packing_slip_id: number;
    status: 'delivered' | 'cancelled';
    paid_amount?: number;
    delivery_charge?: number;
  }[];
};
