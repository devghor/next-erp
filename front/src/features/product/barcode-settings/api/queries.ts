import { queryOptions } from '@tanstack/react-query';
import { getBarcodeSettings } from './service';
import type { BarcodeSetting, BarcodeSettingFilters } from './types';

export type { BarcodeSetting };

export const barcodeSettingKeys = {
  all: ['product', 'barcode-settings'] as const,
  list: (filters: BarcodeSettingFilters) => [...barcodeSettingKeys.all, 'list', filters] as const,
  detail: (id: number) => [...barcodeSettingKeys.all, 'detail', id] as const
};

export const barcodeSettingsQueryOptions = (filters: BarcodeSettingFilters) =>
  queryOptions({
    queryKey: barcodeSettingKeys.list(filters),
    queryFn: () => getBarcodeSettings(filters)
  });
