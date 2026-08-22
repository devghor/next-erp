'use client';

import { useSession } from 'next-auth/react';
import { can } from '@/lib/can';
import type { NavItem, NavGroup } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  const { data: session } = useSession();
  const visible = (item: NavItem) => !item.permissions || can(session?.permissions, item.permissions);
  return items.filter(visible).map((item) => (item.items ? { ...item, items: item.items.filter(visible) } : item));
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const { data: session } = useSession();
  const visible = (item: NavItem) => !item.permissions || can(session?.permissions, item.permissions);
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .filter(visible)
        .map((item) => (item.items ? { ...item, items: item.items.filter(visible) } : item))
    }))
    .filter((group) => group.items.length > 0);
}
