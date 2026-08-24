import { queryOptions } from '@tanstack/react-query';
import { getCoupons } from './service';
import type { Coupon, CouponFilters } from './types';

export type { Coupon };

export const couponKeys = {
  all: ['sales', 'coupons'] as const,
  list: (filters: CouponFilters) => [...couponKeys.all, 'list', filters] as const,
  detail: (id: number) => [...couponKeys.all, 'detail', id] as const
};

export const couponsQueryOptions = (filters: CouponFilters) =>
  queryOptions({
    queryKey: couponKeys.list(filters),
    queryFn: () => getCoupons(filters)
  });
