import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  importCategories
} from './service';
import { categoryKeys } from './queries';
import type { CategoryMutationPayload } from './types';

export const createCategoryMutation = mutationOptions({
  mutationFn: (data: CategoryMutationPayload) => createCategory(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});

export const updateCategoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CategoryMutationPayload }) =>
    updateCategory(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});

export const deleteCategoryMutation = mutationOptions({
  mutationFn: (id: number) => deleteCategory(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});

export const bulkDeleteCategoriesMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteCategories(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});

export const importCategoriesMutation = mutationOptions({
  mutationFn: (file: File) => importCategories(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});
