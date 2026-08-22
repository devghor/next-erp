import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createBrand, updateBrand, deleteBrand, bulkDeleteBrands, importBrands } from './service';
import { brandKeys } from './queries';
import type { BrandMutationPayload } from './types';

export const createBrandMutation = mutationOptions({
  mutationFn: (data: BrandMutationPayload) => createBrand(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});

export const updateBrandMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: BrandMutationPayload }) =>
    updateBrand(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});

export const deleteBrandMutation = mutationOptions({
  mutationFn: (id: number) => deleteBrand(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});

export const bulkDeleteBrandsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteBrands(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});

export const importBrandsMutation = mutationOptions({
  mutationFn: (file: File) => importBrands(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});
