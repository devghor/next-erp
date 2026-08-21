import { queryOptions } from '@tanstack/react-query';
import { getRoles, getPermissionGroups } from './service';
import type { Role, RoleFilters } from './types';

export type { Role };

export const roleKeys = {
  all: ['settings', 'roles'] as const,
  list: (filters: RoleFilters) => [...roleKeys.all, 'list', filters] as const,
  detail: (id: number) => [...roleKeys.all, 'detail', id] as const
};

export const rolesQueryOptions = (filters: RoleFilters) =>
  queryOptions({
    queryKey: roleKeys.list(filters),
    queryFn: () => getRoles(filters)
  });

export const permissionGroupKeys = {
  all: ['settings', 'permissions'] as const
};

export const permissionGroupsQueryOptions = () =>
  queryOptions({
    queryKey: permissionGroupKeys.all,
    queryFn: getPermissionGroups,
    staleTime: Infinity
  });
