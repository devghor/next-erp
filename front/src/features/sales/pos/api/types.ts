export type PosThermalInvoiceSize = '58mm' | '80mm';

export type PosSetting = {
  id: number;
  warehouse_id: number | null;
  biller_id: number | null;
  customer_id: number | null;
  product_number: number;
  keyboard_active: boolean;
  cash_register_active: boolean;
  show_print_invoice: boolean;
  play_sound: boolean;
  payment_options: string[];
  invoice_option: string;
  thermal_invoice_size: PosThermalInvoiceSize;
  // Gateway credentials — surfaced here since the backend returns them on
  // the same settings row, but no gateway UI is built in this pass (a
  // gateway's button only ever renders once its keys are non-empty).
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
  mpesa_consumer_key: string | null;
  mpesa_consumer_secret: string | null;
  mpesa_shortcode: string | null;
  mpesa_passkey: string | null;
  mtnmomo_subscription_key: string | null;
  mtnmomo_api_user: string | null;
  mtnmomo_api_key: string | null;
  mtnmomo_target_environment: string | null;
  payhere_merchant_id: string | null;
  payhere_merchant_secret: string | null;
  created_at: string;
  updated_at: string;
};

export type PosSettingMutationPayload = Partial<
  Omit<PosSetting, 'id' | 'created_at' | 'updated_at'>
>;

export type CashRegisterStatus = 'open' | 'closed';

export type CashRegister = {
  id: number;
  company_id: number;
  warehouse_id: number;
  warehouse_name?: string | null;
  user_id: number;
  user_name?: string | null;
  opening_amount: number;
  closing_amount: number | null;
  expected_amount: number | null;
  status: CashRegisterStatus;
  note: string | null;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OpenCashRegisterPayload = {
  warehouse_id: number;
  opening_amount: number;
  note?: string | null;
};

export type CloseCashRegisterPayload = {
  closing_amount: number;
  note?: string | null;
};

// ------------------------------------------------------------------
// Payment gateways — shapes match `PaymentGatewayController@initiate`/
// `@status` and each `App\Services\Sale\PaymentGateway\*Gateway::initiate()`
// exactly (backend/app/Services/Sale/PaymentGateway/*.php). Responses are
// the raw JSON object returned by `response()->json($result, 201)` — no
// `{ data: ... }` resource wrapper, unlike the rest of this API.
// ------------------------------------------------------------------

export type PosGatewayKey = 'stripe' | 'razorpay' | 'mpesa' | 'mtnmomo' | 'payhere';

/** Display name used for the `paying_method` on the payment row once a gateway payment is confirmed. */
export const POS_GATEWAY_LABELS: Record<PosGatewayKey, string> = {
  stripe: 'Stripe',
  razorpay: 'Razorpay',
  mpesa: 'M-Pesa',
  mtnmomo: 'MTN MoMo',
  payhere: 'PayHere'
};

export type GatewayInitiatePayload = {
  amount: number;
  currency?: string;
  reference?: string;
  /** Required for mpesa/mtnmomo (STK push target); ignored by the other gateways. */
  phone?: string;
};

export type StripeGatewayInitiateResponse = {
  gateway: 'stripe';
  reference: string;
  gateway_reference: string;
  client_secret: string;
  publishable_key: string;
  status: string;
};

export type RazorpayGatewayInitiateResponse = {
  gateway: 'razorpay';
  reference: string;
  gateway_reference: string;
  order_id: string;
  key: string;
  /** Paise (smallest currency unit), as returned by Razorpay's order API. */
  amount: number;
  currency: string;
  status: string;
};

export type MpesaGatewayInitiateResponse = {
  gateway: 'mpesa';
  reference: string;
  gateway_reference: string | null;
  merchant_request_id: string | null;
  response_code: string | null;
  customer_message: string | null;
  status: 'pending';
};

export type MtnMomoGatewayInitiateResponse = {
  gateway: 'mtnmomo';
  reference: string;
  gateway_reference: string;
  status: 'pending';
};

export type PayHereGatewayInitiateResponse = {
  gateway: 'payhere';
  reference: string;
  gateway_reference: string;
  action_url: string;
  merchant_id: string;
  order_id: string;
  amount: string;
  currency: string;
  hash: string;
  status: 'pending';
};

export type GatewayInitiateResponse =
  | StripeGatewayInitiateResponse
  | RazorpayGatewayInitiateResponse
  | MpesaGatewayInitiateResponse
  | MtnMomoGatewayInitiateResponse
  | PayHereGatewayInitiateResponse;

/** `PaymentGatewayController@status` → each gateway's `verify()` return. `paid: true` is the confirmation signal the checkout flow polls for. */
export type GatewayStatus = {
  gateway: PosGatewayKey;
  reference: string;
  status: string;
  paid: boolean;
  amount?: number | string | null;
  [key: string]: unknown;
};
