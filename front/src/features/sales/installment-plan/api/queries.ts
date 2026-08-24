import { queryOptions } from '@tanstack/react-query';
import { getInstallmentPlans, getInstallmentPlan } from './service';
import type { InstallmentPlan, InstallmentPlanFilters } from './types';

export type { InstallmentPlan };

export const installmentPlanKeys = {
  all: ['sale', 'installment-plans'] as const,
  list: (filters: InstallmentPlanFilters) => [...installmentPlanKeys.all, 'list', filters] as const,
  detail: (id: number) => [...installmentPlanKeys.all, 'detail', id] as const
};

export const installmentPlansQueryOptions = (filters: InstallmentPlanFilters) =>
  queryOptions({
    queryKey: installmentPlanKeys.list(filters),
    queryFn: () => getInstallmentPlans(filters)
  });

export const installmentPlanQueryOptions = (id: number) =>
  queryOptions({
    queryKey: installmentPlanKeys.detail(id),
    queryFn: () => getInstallmentPlan(id),
    enabled: id > 0
  });
