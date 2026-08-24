import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  importCoupons
} from './service';
import { couponKeys } from './queries';
import type { CouponMutationPayload } from './types';

export const createCouponMutation = mutationOptions({
  mutationFn: (data: CouponMutationPayload) => createCoupon(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
  }
});

export const updateCouponMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: CouponMutationPayload }) =>
    updateCoupon(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
  }
});

export const deleteCouponMutation = mutationOptions({
  mutationFn: (id: number) => deleteCoupon(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
  }
});

export const bulkDeleteCouponsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteCoupons(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
  }
});

export const importCouponsMutation = mutationOptions({
  mutationFn: (file: File) => importCoupons(file),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: couponKeys.all });
  }
});
