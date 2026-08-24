// ============================================================
// POS Service — Data Access Layer
// ============================================================
// Covers PosSetting get/update, CashRegister availability/open/close/
// details, and payment-gateway initiate/status. Sale creation itself
// reuses features/sales/sales/api/service.ts (createSale/updateSale) —
// not duplicated here.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type {
  PosSetting,
  PosSettingMutationPayload,
  CashRegister,
  OpenCashRegisterPayload,
  CloseCashRegisterPayload,
  PosGatewayKey,
  GatewayInitiatePayload,
  GatewayInitiateResponse,
  GatewayStatus
} from './types';

const SETTINGS_BASE = '/sale/pos/settings';
const CASH_REGISTER_BASE = '/sale/pos/cash-register';
const GATEWAYS_BASE = '/sale/pos/gateways';

// PosSettingController/CashRegisterController return the Eloquent model (or
// service result) directly — no `{ data }` wrapper, same as SaleSettingController.

export async function getPosSettings(): Promise<PosSetting> {
  return apiClient<PosSetting>(SETTINGS_BASE);
}

export async function updatePosSettings(data: PosSettingMutationPayload): Promise<PosSetting> {
  return apiClient<PosSetting>(SETTINGS_BASE, { method: 'PUT', data });
}

export async function checkRegisterAvailability(warehouseId: number): Promise<CashRegister | null> {
  return apiClient<CashRegister | null>(`${CASH_REGISTER_BASE}/availability/${warehouseId}`);
}

export async function openRegister(data: OpenCashRegisterPayload): Promise<CashRegister> {
  return apiClient<CashRegister>(CASH_REGISTER_BASE, { method: 'POST', data });
}

export async function closeRegister(id: number, data: CloseCashRegisterPayload): Promise<CashRegister> {
  return apiClient<CashRegister>(`${CASH_REGISTER_BASE}/${id}/close`, { method: 'PUT', data });
}

export async function getRegisterDetails(id: number): Promise<CashRegister> {
  return apiClient<CashRegister>(`${CASH_REGISTER_BASE}/${id}`);
}

/**
 * Starts a gateway payment. Response is raw JSON (no `data` wrapper) —
 * `PaymentGatewayController@initiate` returns `$gateway->initiate($context)`
 * as-is. Shape varies by gateway; see `GatewayInitiateResponse`.
 */
export async function initiateGatewayPayment(
  gateway: PosGatewayKey,
  data: GatewayInitiatePayload
): Promise<GatewayInitiateResponse> {
  return apiClient<GatewayInitiateResponse>(`${GATEWAYS_BASE}/${gateway}/initiate`, {
    method: 'POST',
    data
  });
}

/** Polling endpoint — `paid: true` once the gateway confirms the payment. */
export async function getGatewayStatus(gateway: PosGatewayKey, reference: string): Promise<GatewayStatus> {
  return apiClient<GatewayStatus>(`${GATEWAYS_BASE}/${gateway}/status/${reference}`);
}
