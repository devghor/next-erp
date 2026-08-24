'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useAppForm } from '@/lib/form';
import { getQueryClient } from '@/lib/query-client';
import { rechargeGiftCardMutation } from '../api/mutations';
import { giftCardKeys } from '../api/queries';
import type { GiftCard } from '../api/types';
import { rechargeSchema } from '../schemas/gift-card';

interface GiftCardRechargeDialogProps {
  giftCard: GiftCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GiftCardRechargeDialog({ giftCard, open, onOpenChange }: GiftCardRechargeDialogProps) {
  const rechargeMutation = useMutation({
    ...rechargeGiftCardMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: giftCardKeys.all });
      toast.success('Gift card recharged');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error("Couldn't recharge gift card. Try again.")
  });

  const form = useAppForm({
    defaultValues: { amount: 0 },
    validators: { onSubmit: rechargeSchema },
    onSubmit: async ({ value }) => {
      await rechargeMutation.mutateAsync({ id: giftCard.id, amount: value.amount });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recharge {giftCard.card_no}</DialogTitle>
          <DialogDescription>
            Current balance: {giftCard.balance.toFixed(2)}. Add funds to this gift card.
          </DialogDescription>
        </DialogHeader>

        <form
          id='gift-card-recharge-form'
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='amount'
              children={(field) => (
                <field.TextField label='Recharge Amount' type='number' step='0.01' required />
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton loading={rechargeMutation.isPending} type='submit' form='gift-card-recharge-form'>
            Recharge
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
