'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { openRegisterMutation, closeRegisterMutation } from '../api/mutations';
import type { CashRegister } from '../api/types';
import { formatMoney } from '../lib/money';

export interface PosCashRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: number;
  register: CashRegister | null;
  currencyCode?: string | null;
  onOpened: (register: CashRegister) => void;
  onClosed: () => void;
}

/** Open/close/details for the cashier's cash-register session at the active warehouse. */
export function PosCashRegisterDialog({
  open,
  onOpenChange,
  warehouseId,
  register,
  currencyCode,
  onOpened,
  onClosed
}: PosCashRegisterDialogProps) {
  const [openingAmount, setOpeningAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setOpeningAmount(0);
      setClosingAmount(register?.expected_amount ?? 0);
      setNote('');
    }
  }, [open, register]);

  const openMutation = useMutation({
    ...openRegisterMutation,
    onSuccess: (opened) => {
      toast.success('Register opened');
      onOpened(opened);
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't open the register. Try again.")
  });

  const closeMutation = useMutation({
    ...closeRegisterMutation,
    onSuccess: () => {
      toast.success('Register closed');
      onClosed();
      onOpenChange(false);
    },
    onError: () => toast.error("Couldn't close the register. Try again.")
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Icons.pos className='h-5 w-5' />
            Cash Register
          </DialogTitle>
          <DialogDescription>
            {register ? 'Close the current register session.' : 'Open a register session before ringing up sales.'}
          </DialogDescription>
        </DialogHeader>

        {register ? (
          <div className='space-y-4'>
            <div className='bg-muted grid grid-cols-2 gap-2 rounded-md p-3 text-sm'>
              <div>
                <p className='text-muted-foreground text-xs'>Opened</p>
                <p className='font-medium'>{new Date(register.opened_at).toLocaleString()}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>Opening Amount</p>
                <p className='font-medium'>{formatMoney(register.opening_amount, { currencyCode })}</p>
              </div>
              {typeof register.expected_amount === 'number' && (
                <div className='col-span-2'>
                  <p className='text-muted-foreground text-xs'>Expected in Drawer</p>
                  <p className='font-medium'>{formatMoney(register.expected_amount, { currencyCode })}</p>
                </div>
              )}
            </div>

            <Field>
              <FieldLabel>Closing amount</FieldLabel>
              <Input
                type='number'
                min={0}
                step='0.01'
                value={closingAmount}
                onChange={(e) => setClosingAmount(Number(e.target.value) || 0)}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel>Note</FieldLabel>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </Field>
          </div>
        ) : (
          <div className='space-y-4'>
            <Field>
              <FieldLabel>Opening amount</FieldLabel>
              <Input
                type='number'
                min={0}
                step='0.01'
                value={openingAmount}
                onChange={(e) => setOpeningAmount(Number(e.target.value) || 0)}
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel>Note</FieldLabel>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </Field>
          </div>
        )}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {register ? (
            <LoadingButton
              loading={closeMutation.isPending}
              type='button'
              onClick={() => closeMutation.mutate({ id: register.id, values: { closing_amount: closingAmount, note: note || null } })}
            >
              <Icons.registerClose className='mr-1.5 h-4 w-4' /> Close Register
            </LoadingButton>
          ) : (
            <LoadingButton
              loading={openMutation.isPending}
              type='button'
              disabled={warehouseId <= 0}
              onClick={() => openMutation.mutate({ warehouse_id: warehouseId, opening_amount: openingAmount, note: note || null })}
            >
              <Icons.registerOpen className='mr-1.5 h-4 w-4' /> Open Register
            </LoadingButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
