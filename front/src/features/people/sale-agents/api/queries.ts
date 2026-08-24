import { queryOptions } from '@tanstack/react-query';
import { getSaleAgents } from './service';
import type { SaleAgent, SaleAgentFilters } from './types';

export type { SaleAgent };

export const saleAgentKeys = {
  all: ['people', 'sale-agents'] as const,
  list: (filters: SaleAgentFilters) => [...saleAgentKeys.all, 'list', filters] as const,
  detail: (id: number) => [...saleAgentKeys.all, 'detail', id] as const
};

export const saleAgentsQueryOptions = (filters: SaleAgentFilters) =>
  queryOptions({
    queryKey: saleAgentKeys.list(filters),
    queryFn: () => getSaleAgents(filters)
  });
