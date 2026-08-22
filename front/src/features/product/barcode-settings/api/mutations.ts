import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createBarcodeSetting,
  updateBarcodeSetting,
  deleteBarcodeSetting,
  bulkDeleteBarcodeSettings,
  setDefaultBarcodeSetting
} from './service';
import { barcodeSettingKeys } from './queries';
import type { BarcodeSettingMutationPayload } from './types';

export const createBarcodeSettingMutation = mutationOptions({
  mutationFn: (data: BarcodeSettingMutationPayload) => createBarcodeSetting(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
  }
});

export const updateBarcodeSettingMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: BarcodeSettingMutationPayload }) =>
    updateBarcodeSetting(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
  }
});

export const deleteBarcodeSettingMutation = mutationOptions({
  mutationFn: (id: number) => deleteBarcodeSetting(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
  }
});

export const bulkDeleteBarcodeSettingsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteBarcodeSettings(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
  }
});

export const setDefaultBarcodeSettingMutation = mutationOptions({
  mutationFn: (id: number) => setDefaultBarcodeSetting(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: barcodeSettingKeys.all });
  }
});
