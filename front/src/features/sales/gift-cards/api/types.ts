export type GiftCard = {
  id: number;
  card_no: string;
  amount: number;
  expense: number;
  balance: number;
  customer_id: number | null;
  customer_name?: string | null;
  user_id: number | null;
  user_name?: string | null;
  expired_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GiftCardFilters = {
  id?: string;
  card_no?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type GiftCardsResponse = {
  data: GiftCard[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type GiftCardMutationPayload = {
  card_no: string;
  amount?: number;
  customer_id?: number | null;
  user_id?: number | null;
  expired_date?: string | null;
};
