import { queryOptions } from '@tanstack/react-query';
import { getPosSettings, checkRegisterAvailability, getRegisterDetails, getGatewayStatus } from './service';
import type { PosSetting, CashRegister, PosGatewayKey } from './types';

export type { PosSetting, CashRegister };

export const posSettingsKeys = {
  all: ['sales', 'pos', 'settings'] as const
};

export const posSettingsQueryOptions = () =>
  queryOptions({
    queryKey: posSettingsKeys.all,
    queryFn: () => getPosSettings()
  });

export const cashRegisterKeys = {
  all: ['sales', 'pos', 'cash-register'] as const,
  availability: (warehouseId: number) => [...cashRegisterKeys.all, 'availability', warehouseId] as const,
  detail: (id: number) => [...cashRegisterKeys.all, 'detail', id] as const
};

export const cashRegisterAvailabilityQueryOptions = (warehouseId: number) =>
  queryOptions({
    queryKey: cashRegisterKeys.availability(warehouseId),
    queryFn: () => checkRegisterAvailability(warehouseId),
    enabled: warehouseId > 0
  });

export const cashRegisterDetailsQueryOptions = (id: number) =>
  queryOptions({
    queryKey: cashRegisterKeys.detail(id),
    queryFn: () => getRegisterDetails(id),
    enabled: id > 0
  });

export const gatewayStatusKeys = {
  all: ['sales', 'pos', 'gateway-status'] as const,
  detail: (gateway: PosGatewayKey, reference: string) => [...gatewayStatusKeys.all, gateway, reference] as const
};

/**
 * Polls `GET gateways/{gateway}/status/{reference}` every 3s while enabled.
 * Caller (pos-gateway-dialog.tsx) flips `enabled` off once `paid` is true or
 * the payment is abandoned/failed, stopping the poll.
 */
export const gatewayStatusQueryOptions = (gateway: PosGatewayKey, reference: string, enabled: boolean) =>
  queryOptions({
    queryKey: gatewayStatusKeys.detail(gateway, reference),
    queryFn: () => getGatewayStatus(gateway, reference),
    enabled: enabled && reference.length > 0,
    refetchInterval: (query) => (query.state.data?.paid ? false : 3000),
    refetchOnWindowFocus: false
  });
