import { queryOptions } from '@tanstack/react-query';
import { getGiftCards } from './service';
import type { GiftCard, GiftCardFilters } from './types';

export type { GiftCard };

export const giftCardKeys = {
  all: ['sales', 'gift-cards'] as const,
  list: (filters: GiftCardFilters) => [...giftCardKeys.all, 'list', filters] as const,
  detail: (id: number) => [...giftCardKeys.all, 'detail', id] as const
};

export const giftCardsQueryOptions = (filters: GiftCardFilters) =>
  queryOptions({
    queryKey: giftCardKeys.list(filters),
    queryFn: () => getGiftCards(filters)
  });
