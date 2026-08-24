'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons, type Icon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { createSaleMutation, updateSaleMutation } from '@/features/sales/sales/api/mutations';
import type { Sale, SaleMutationPayload, SalePaymentInput } from '@/features/sales/sales/api/types';
import { giftCardsQueryOptions } from '@/features/sales/gift-cards/api/queries';
import type { UsePosCartReturn } from '../hooks/use-pos-cart';
import { formatMoney } from '../lib/money';
import { isOfflineFailure, type UseOfflineQueueReturn } from '../hooks/use-offline-queue';
import { POS_GATEWAY_LABELS, type PosGatewayKey, type PosSetting } from '../api/types';
import { PosInstallmentDialog, type PosInstallmentInput } from './pos-installment-dialog';
import { PosGatewayDialog, type PosGatewayCustomer } from './pos-gateway-dialog';

const QUICK_METHODS = ['Cash', 'Card', 'Cheque', 'Gift Card', 'Deposit', 'Points'] as const;

const GATEWAY_ICONS: Record<PosGatewayKey, Icon> = {
  stripe: Icons.gatewayStripe,
  razorpay: Icons.creditCard,
  mpesa: Icons.gatewayMobileMoney,
  mtnmomo: Icons.gatewayMobileMoney,
  payhere: Icons.externalLink
};

/** A gateway's payment button only ever renders once its required credential(s) are non-empty on the loaded `PosSetting` — matching salespro's behavior. */
function availableGatewaysFor(posSettings: PosSetting): PosGatewayKey[] {
  const gateways: PosGatewayKey[] = [];
  if (posSettings.stripe_public_key && posSettings.stripe_secret_key) gateways.push('stripe');
  if (posSettings.razorpay_key_id && posSettings.razorpay_key_secret) gateways.push('razorpay');
  if (posSettings.mpesa_consumer_key && posSettings.mpesa_consumer_secret && posSettings.mpesa_shortcode && posSettings.mpesa_passkey) {
    gateways.push('mpesa');
  }
  if (posSettings.mtnmomo_subscription_key && posSettings.mtnmomo_api_user && posSettings.mtnmomo_api_key) gateways.push('mtnmomo');
  if (posSettings.payhere_merchant_id && posSettings.payhere_merchant_secret) gateways.push('payhere');
  return gateways;
}

function generateClientReference(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pos-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface PosCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: UsePosCartReturn;
  customerId: number | null;
  warehouseId: number;
  billerId: number | null;
  currencyId: number | null;
  currencyCode?: string | null;
  cashRegisterId: number | null;
  posSettings: PosSetting;
  customer: PosGatewayCustomer | null;
  offlineQueue: UseOfflineQueueReturn;
  onSuccess: (sale: Sale) => void;
  /** Fired instead of `onSuccess` when the sale couldn't reach the backend and was queued for background sync (see use-offline-queue.ts). */
  onQueuedOffline: (clientReference: string) => void;
}

/** Cashier checkout modal — payment-method buttons + split-payment table, adapted from sale-payments-editor.tsx's field shapes, plus gateway (Stripe/Razorpay/M-Pesa/MTN MoMo/PayHere) buttons gated on PosSetting credentials. */
export function PosCheckoutDialog({
  open,
  onOpenChange,
  cart,
  customerId,
  warehouseId,
  billerId,
  currencyId,
  currencyCode,
  cashRegisterId,
  posSettings,
  customer,
  offlineQueue,
  onSuccess,
  onQueuedOffline
}: PosCheckoutDialogProps) {
  const [payments, setPayments] = useState<SalePaymentInput[]>([]);
  const [mode, setMode] = useState<'single' | 'multiple' | 'credit'>('single');
  const [installment, setInstallment] = useState<PosInstallmentInput | null>(null);
  const [installmentDialogOpen, setInstallmentDialogOpen] = useState(false);
  const [giftCardLookup, setGiftCardLookup] = useState('');
  const [clientReference, setClientReference] = useState(generateClientReference);
  const [activeGateway, setActiveGateway] = useState<PosGatewayKey | null>(null);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [gatewayAmount, setGatewayAmount] = useState(0);

  const availableGateways = useMemo(() => availableGatewaysFor(posSettings), [posSettings]);

  const { totals, state } = cart;
  const grandTotal = totals.grandTotal;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const change = Math.max(0, totalPaid - grandTotal);
  const due = Math.max(0, grandTotal - totalPaid);

  useEffect(() => {
    if (open) {
      setClientReference(generateClientReference());
      setPayments(grandTotal > 0 ? [{ paying_method: 'Cash', amount: grandTotal }] : []);
      setMode('single');
      setInstallment(null);
    }
  }, [open, grandTotal]);

  const { data: giftCardData } = useQuery({
    ...giftCardsQueryOptions({ card_no: giftCardLookup, per_page: 1 }),
    enabled: giftCardLookup.length > 0
  });

  const createMutation = useMutation({
    ...createSaleMutation,
    onSuccess: (sale) => {
      toast.success('Sale completed');
      onSuccess(sale);
    },
    onError: (error) => {
      // Network/offline failures are handled by handleConfirm's own catch (queue + a friendlier toast) — don't double-toast.
      if (!isOfflineFailure(error)) toast.error("Couldn't complete the sale. Try again.");
    }
  });

  const updateMutation = useMutation({
    ...updateSaleMutation,
    onSuccess: (sale) => {
      toast.success('Sale completed');
      onSuccess(sale);
    },
    onError: () => toast.error("Couldn't complete the sale. Try again.")
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function selectQuickMethod(method: (typeof QUICK_METHODS)[number]) {
    setMode('single');
    if (method === 'Gift Card') {
      setPayments([{ paying_method: method, amount: grandTotal, gift_card_id: giftCardData?.data?.[0]?.id ?? null }]);
    } else {
      setPayments([{ paying_method: method, amount: grandTotal }]);
    }
  }

  function selectCredit() {
    setMode('credit');
    setPayments([]);
  }

  /** Opens the gateway dialog for the full grand total, like the other quick-method buttons — the payment row itself is only added once the gateway confirms (see the dialog's onSuccess below). */
  function selectGateway(gateway: PosGatewayKey) {
    setMode('single');
    setActiveGateway(gateway);
    setGatewayAmount(grandTotal);
    setPayments([]);
    setGatewayDialogOpen(true);
  }

  function selectMultiple() {
    setMode('multiple');
    if (payments.length === 0) setPayments([{ paying_method: 'Cash', amount: 0 }]);
  }

  function updatePaymentRow(index: number, patch: Partial<SalePaymentInput>) {
    setPayments((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removePaymentRow(index: number) {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    if (!customerId) {
      toast.error('Select a customer before checkout');
      return;
    }
    if (state.lines.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (mode !== 'credit' && due > 0 && !installment) {
      toast.error(`Payment is short by ${formatMoney(due, { currencyCode })}`);
      return;
    }

    const combinedDiscount = totals.orderDiscountAmount + totals.couponDiscountAmount;

    const payload: SaleMutationPayload = {
      customer_id: customerId,
      warehouse_id: warehouseId,
      biller_id: billerId,
      currency_id: currencyId,
      sale_status: 'completed',
      order_tax_rate: state.order_tax_rate,
      order_discount_type: 'fixed',
      order_discount_value: combinedDiscount,
      coupon_id: state.coupon?.id ?? null,
      shipping_cost: state.shipping_cost,
      sale_note: state.sale_note || null,
      is_pos: true,
      cash_register_id: cashRegisterId,
      client_reference: clientReference,
      items: state.lines.map((line) => ({
        product_id: line.product_id,
        variant_id: line.variant_id,
        batch_id: line.batch_id,
        sale_unit_id: line.sale_unit_id,
        qty: line.qty,
        net_unit_price: line.net_unit_price,
        discount: line.discount,
        tax_rate: line.tax_rate
      })),
      payments: payments.filter((p) => p.amount > 0),
      installment: installment
        ? {
            name: installment.name,
            price: installment.price,
            additional_amount: installment.additional_amount,
            down_payment: installment.down_payment,
            months: installment.months
          }
        : null
    };

    if (state.draft_sale_id) {
      // Finalizing an existing draft needs connectivity — it targets a specific
      // server-side row, which the offline queue (create-only) doesn't cover.
      await updateMutation.mutateAsync({ id: state.draft_sale_id, values: payload });
      return;
    }

    try {
      await createMutation.mutateAsync(payload);
    } catch (error) {
      if (isOfflineFailure(error)) {
        offlineQueue.enqueue(payload, clientReference);
        toast.info('No connection — sale queued and will sync automatically once back online.');
        onQueuedOffline(clientReference);
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='flex max-h-[92vh] flex-col sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>Choose a payment method and confirm to complete the sale.</DialogDescription>
          </DialogHeader>

          <div className='flex-1 space-y-4 overflow-auto'>
            <div className='bg-muted flex items-center justify-between rounded-md p-3'>
              <span className='text-sm font-medium'>Grand Total</span>
              <span className='text-xl font-bold'>{formatMoney(grandTotal, { currencyCode })}</span>
            </div>

            <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
              {QUICK_METHODS.map((method) => (
                <Button
                  key={method}
                  type='button'
                  variant={mode === 'single' && payments[0]?.paying_method === method ? 'default' : 'outline'}
                  className='h-16 flex-col gap-1'
                  onClick={() => selectQuickMethod(method)}
                >
                  <Icons.wallet className='h-4 w-4' />
                  <span className='text-xs'>{method}</span>
                </Button>
              ))}
              <Button
                type='button'
                variant={mode === 'credit' ? 'default' : 'outline'}
                className='h-16 flex-col gap-1'
                onClick={selectCredit}
              >
                <Icons.creditCard className='h-4 w-4' />
                <span className='text-xs'>Credit</span>
              </Button>
              <Button
                type='button'
                variant={mode === 'multiple' ? 'default' : 'outline'}
                className='h-16 flex-col gap-1'
                onClick={selectMultiple}
              >
                <Icons.grid className='h-4 w-4' />
                <span className='text-xs'>Multiple</span>
              </Button>
              <Button
                type='button'
                variant={installment ? 'default' : 'outline'}
                className='h-16 flex-col gap-1'
                onClick={() => setInstallmentDialogOpen(true)}
              >
                <Icons.billing className='h-4 w-4' />
                <span className='text-xs'>Installment</span>
              </Button>
            </div>

            {availableGateways.length > 0 && (
              <div className='space-y-1.5'>
                <p className='text-muted-foreground text-xs font-medium'>Payment Gateways</p>
                <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
                  {availableGateways.map((gateway) => {
                    const GatewayIcon = GATEWAY_ICONS[gateway];
                    const isActive = mode === 'single' && payments[0]?.paying_method === POS_GATEWAY_LABELS[gateway];
                    return (
                      <Button
                        key={gateway}
                        type='button'
                        variant={isActive ? 'default' : 'outline'}
                        className='h-16 flex-col gap-1'
                        onClick={() => selectGateway(gateway)}
                      >
                        <GatewayIcon className='h-4 w-4' />
                        <span className='text-xs'>{POS_GATEWAY_LABELS[gateway]}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {payments[0]?.paying_method === 'Gift Card' && mode === 'single' && (
              <Field>
                <FieldLabel>Gift card number</FieldLabel>
                <Input
                  value={giftCardLookup}
                  onChange={(e) => setGiftCardLookup(e.target.value)}
                  placeholder='Scan or type the gift card number'
                />
                {giftCardData?.data?.[0] && (
                  <p className='text-sm text-emerald-600'>Balance: {formatMoney(giftCardData.data[0].balance, { currencyCode })}</p>
                )}
              </Field>
            )}

            {installment && (
              <div className='bg-muted flex items-center justify-between rounded-md p-3 text-sm'>
                <span>
                  Installment: {installment.name} — {installment.months} months, down payment {formatMoney(installment.down_payment, { currencyCode })}
                </span>
                <Button type='button' variant='ghost' size='sm' onClick={() => setInstallment(null)}>
                  Remove
                </Button>
              </div>
            )}

            {mode !== 'credit' && (
              <div className='overflow-x-auto rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='min-w-[140px]'>Method</TableHead>
                      <TableHead className='w-32'>Amount</TableHead>
                      {mode === 'multiple' && <TableHead className='w-10' />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {mode === 'multiple' ? (
                            <select
                              className='border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm'
                              value={row.paying_method}
                              onChange={(e) => updatePaymentRow(index, { paying_method: e.target.value })}
                            >
                              {[...QUICK_METHODS].map((method) => (
                                <option key={method} value={method}>
                                  {method}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.paying_method
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type='number'
                            min={0}
                            step='0.01'
                            value={row.amount}
                            onChange={(e) => updatePaymentRow(index, { amount: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        {mode === 'multiple' && (
                          <TableCell>
                            <Button type='button' variant='ghost' size='icon' onClick={() => removePaymentRow(index)}>
                              <Icons.trash className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {mode === 'multiple' && (
                  <div className='p-2'>
                    <Button
                      type='button'
                      variant='secondary'
                      size='sm'
                      onClick={() => setPayments((prev) => [...prev, { paying_method: 'Cash', amount: 0 }])}
                    >
                      <Icons.add className='mr-2 h-4 w-4' /> Add Payment
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className='grid grid-cols-3 gap-2 text-center'>
              <div className='rounded-md border p-2'>
                <p className='text-muted-foreground text-xs'>Paid</p>
                <p className='font-semibold'>{formatMoney(totalPaid, { currencyCode })}</p>
              </div>
              <div className={cn('rounded-md border p-2', change > 0 && 'border-emerald-400')}>
                <p className='text-muted-foreground text-xs'>Change</p>
                <p className='font-semibold'>{formatMoney(change, { currencyCode })}</p>
              </div>
              <div className={cn('rounded-md border p-2', due > 0 && 'border-amber-400')}>
                <p className='text-muted-foreground text-xs'>Due</p>
                <p className='font-semibold'>{formatMoney(due, { currencyCode })}</p>
              </div>
            </div>

            {due > 0 && (
              <Badge variant={installment ? 'secondary' : 'destructive'} className='w-full justify-center py-1.5'>
                {installment ? 'Remaining balance covered by the installment plan' : `Short by ${formatMoney(due, { currencyCode })}`}
              </Badge>
            )}
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton loading={isPending} type='button' onClick={handleConfirm}>
              Complete Sale
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PosInstallmentDialog
        open={installmentDialogOpen}
        onOpenChange={setInstallmentDialogOpen}
        grandTotal={due}
        onConfirm={(value) => {
          setInstallment(value);
          setPayments(value.down_payment > 0 ? [{ paying_method: 'Cash', amount: value.down_payment }] : []);
          setMode('single');
        }}
      />

      {activeGateway && (
        <PosGatewayDialog
          open={gatewayDialogOpen}
          onOpenChange={setGatewayDialogOpen}
          gateway={activeGateway}
          amount={gatewayAmount}
          currencyCode={currencyCode}
          reference={clientReference}
          customer={customer}
          onSuccess={(result) => {
            setPayments([
              {
                paying_method: POS_GATEWAY_LABELS[activeGateway],
                amount: gatewayAmount,
                gateway_reference: result.gateway_reference,
                gateway_status: result.gateway_status
              }
            ]);
            setGatewayDialogOpen(false);
            toast.success(`${POS_GATEWAY_LABELS[activeGateway]} payment confirmed`);
          }}
        />
      )}
    </>
  );
}
