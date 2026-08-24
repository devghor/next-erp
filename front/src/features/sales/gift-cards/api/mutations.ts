import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  bulkDeleteGiftCards,
  rechargeGiftCard
} from './service';
import { giftCardKeys } from './queries';
import type { GiftCardMutationPayload } from './types';

export const createGiftCardMutation = mutationOptions({
  mutationFn: (data: GiftCardMutationPayload) => createGiftCard(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
  }
});

export const updateGiftCardMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: GiftCardMutationPayload }) =>
    updateGiftCard(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
  }
});

export const deleteGiftCardMutation = mutationOptions({
  mutationFn: (id: number) => deleteGiftCard(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
  }
});

export const bulkDeleteGiftCardsMutation = mutationOptions({
  mutationFn: (ids: number[]) => bulkDeleteGiftCards(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
  }
});

export const rechargeGiftCardMutation = mutationOptions({
  mutationFn: ({ id, amount }: { id: number; amount: number }) => rechargeGiftCard(id, amount),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
  }
});
