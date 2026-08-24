import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { updatePosSettings, openRegister, closeRegister, initiateGatewayPayment } from './service';
import { posSettingsKeys, cashRegisterKeys } from './queries';
import type {
  PosSettingMutationPayload,
  OpenCashRegisterPayload,
  CloseCashRegisterPayload,
  PosGatewayKey,
  GatewayInitiatePayload
} from './types';

// Sale creation/hold reuses createSaleMutation/updateSaleMutation from
// features/sales/sales/api/mutations.ts — intentionally not duplicated here.

export const updatePosSettingsMutation = mutationOptions({
  mutationFn: (data: PosSettingMutationPayload) => updatePosSettings(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: posSettingsKeys.all });
  }
});

export const openRegisterMutation = mutationOptions({
  mutationFn: (data: OpenCashRegisterPayload) => openRegister(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: cashRegisterKeys.all });
  }
});

export const closeRegisterMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CloseCashRegisterPayload }) => closeRegister(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: cashRegisterKeys.all });
  }
});

export const initiateGatewayPaymentMutation = mutationOptions({
  mutationFn: ({ gateway, values }: { gateway: PosGatewayKey; values: GatewayInitiatePayload }) =>
    initiateGatewayPayment(gateway, values)
});
