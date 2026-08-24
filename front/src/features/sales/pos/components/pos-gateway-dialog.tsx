'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingButton } from '@/components/ui/loading-button';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import { initiateGatewayPaymentMutation } from '../api/mutations';
import { gatewayStatusQueryOptions } from '../api/queries';
import { POS_GATEWAY_LABELS } from '../api/types';
import type {
  PosGatewayKey,
  GatewayInitiateResponse,
  StripeGatewayInitiateResponse,
  RazorpayGatewayInitiateResponse,
  MpesaGatewayInitiateResponse,
  PayHereGatewayInitiateResponse
} from '../api/types';
import { formatMoney } from '../lib/money';

// Razorpay's checkout.js is the one documented exception to "no external
// scripts" — it's injected at runtime, once, and cached on `window`.
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;
function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window unavailable'));
  if (window.Razorpay) return Promise.resolve();
  razorpayScriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Failed to load the Razorpay checkout script')));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();
function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  let promise = stripePromiseCache.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripePromiseCache.set(publishableKey, promise);
  }
  return promise;
}

type GatewayPhase = 'phone' | 'initiating' | 'card' | 'processing' | 'succeeded' | 'failed';

export type PosGatewayCustomer = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

export interface PosGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateway: PosGatewayKey;
  amount: number;
  currencyCode?: string | null;
  /** Idempotency reference for this checkout attempt — reused as the gateway's `reference` where the gateway respects it. */
  reference: string;
  customer: PosGatewayCustomer | null;
  onSuccess: (result: { gateway_reference: string; gateway_status: string }) => void;
}

/**
 * `gateway_reference` is the id every `*Gateway::verify()` on the backend
 * actually keys off (Stripe PaymentIntent id, Razorpay order id, M-Pesa
 * CheckoutRequestID, MTN MoMo/PayHere's own reference) — not always the same
 * as the request-level `reference` we sent in. Always poll with it.
 */
function gatewayReferenceOf(result: GatewayInitiateResponse | null): string | null {
  return result?.gateway_reference ?? null;
}

function openPayHereCheckout(
  result: PayHereGatewayInitiateResponse,
  customer: PosGatewayCustomer | null,
  popupRef: React.MutableRefObject<Window | null>
): boolean {
  const popup = window.open('', 'pos_payhere_checkout', 'width=480,height=760');
  if (!popup) {
    toast.error('Pop-up blocked — allow pop-ups for this site to complete the PayHere payment.');
    return false;
  }
  popupRef.current = popup;

  const [firstName, ...rest] = (customer?.name ?? 'Guest Customer').split(' ');
  const notifyUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''}/sale/pos/gateways/payhere/callback`;
  const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/pos` : '/pos';

  const fields: Record<string, string> = {
    merchant_id: result.merchant_id,
    return_url: returnUrl,
    cancel_url: returnUrl,
    notify_url: notifyUrl,
    order_id: result.order_id,
    items: 'POS Sale',
    currency: result.currency,
    amount: result.amount,
    hash: result.hash,
    first_name: firstName || 'Guest',
    last_name: rest.join(' ') || 'Customer',
    email: customer?.email || 'guest@example.com',
    phone: customer?.phone || '0000000000',
    address: customer?.address || 'N/A',
    city: customer?.city || 'N/A',
    country: customer?.country || 'N/A'
  };

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = result.action_url;
  form.target = 'pos_payhere_checkout';
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
  return true;
}

async function openRazorpayCheckout(
  result: RazorpayGatewayInitiateResponse,
  handlers: { onPaid: () => void; onFailed: (message: string) => void }
) {
  try {
    await loadRazorpayScript();
  } catch {
    handlers.onFailed('Could not load the Razorpay checkout script.');
    return;
  }
  if (!window.Razorpay) {
    handlers.onFailed('Razorpay checkout is unavailable.');
    return;
  }
  const rzp = new window.Razorpay({
    key: result.key,
    order_id: result.order_id,
    amount: result.amount,
    currency: result.currency,
    name: 'POS Sale',
    handler: () => handlers.onPaid(),
    modal: { ondismiss: () => handlers.onFailed('Razorpay checkout was closed before completing payment.') }
  });
  rzp.on('payment.failed', () => handlers.onFailed('Razorpay reported the payment as failed.'));
  rzp.open();
}

/** Card entry + confirm step, rendered inside `<Elements>` once Stripe's `client_secret` is known. */
function StripePaymentForm({
  amountLabel,
  onPaid,
  onProcessing,
  onFailed
}: {
  amountLabel: string;
  onPaid: (paymentIntentId: string, status: string) => void;
  onProcessing: () => void;
  onFailed: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });
    setSubmitting(false);
    if (error) {
      onFailed(error.message ?? 'The card payment failed.');
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onPaid(paymentIntent.id, paymentIntent.status);
    } else {
      onProcessing();
    }
  }

  return (
    <div className='space-y-4'>
      <PaymentElement />
      <LoadingButton loading={submitting} type='button' className='w-full' onClick={handlePay} disabled={!stripe || !elements}>
        Pay {amountLabel}
      </LoadingButton>
    </div>
  );
}

/** One dialog for every gateway (Stripe/Razorpay/M-Pesa/MTN MoMo/PayHere) — renders the right sub-view per gateway and reports back through the same `onSuccess` mechanism regardless of which one ran. */
export function PosGatewayDialog({ open, onOpenChange, gateway, amount, currencyCode, reference, customer, onSuccess }: PosGatewayDialogProps) {
  const [phase, setPhase] = useState<GatewayPhase>('phone');
  const [phone, setPhone] = useState('');
  const [initiateResult, setInitiateResult] = useState<GatewayInitiateResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);

  const needsPhone = gateway === 'mpesa' || gateway === 'mtnmomo';
  const initiateMutation = useMutation(initiateGatewayPaymentMutation);
  const amountLabel = formatMoney(amount, { currencyCode });
  const label = POS_GATEWAY_LABELS[gateway];

  // Reset all state whenever the dialog opens (or switches gateway).
  useEffect(() => {
    if (!open) return;
    setInitiateResult(null);
    setErrorMessage(null);
    setPhone(customer?.phone ?? '');
    setPhase(needsPhone ? 'phone' : 'initiating');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, gateway]);

  // Close any open PayHere popup once the dialog is dismissed.
  useEffect(() => {
    if (open) return;
    popupRef.current?.close();
    popupRef.current = null;
  }, [open]);

  function runInitiate(withPhone?: string) {
    setPhase('initiating');
    setErrorMessage(null);
    initiateMutation.mutate(
      { gateway, values: { amount, currency: currencyCode ?? undefined, reference, phone: withPhone } },
      {
        onSuccess: (result) => {
          setInitiateResult(result);
          if (result.gateway === 'stripe') {
            setPhase('card');
            return;
          }
          setPhase('processing');
          if (result.gateway === 'razorpay') {
            openRazorpayCheckout(result, {
              onPaid: () => {
                /* Client-side handler is just a UX cue — the status poll below is the source of truth. */
              },
              onFailed: (message) => {
                setErrorMessage(message);
                setPhase('failed');
              }
            });
          }
          if (result.gateway === 'payhere') {
            const opened = openPayHereCheckout(result, customer, popupRef);
            if (!opened) {
              setErrorMessage('Could not open the PayHere checkout window.');
              setPhase('failed');
            }
          }
        },
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Could not start the payment.');
          setPhase('failed');
        }
      }
    );
  }

  useEffect(() => {
    if (!open || needsPhone) return;
    if (phase !== 'initiating') return;
    if (initiateMutation.isPending) return;
    runInitiate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, needsPhone, phase]);

  const gatewayReference = gatewayReferenceOf(initiateResult);
  const statusQuery = useQuery(
    gatewayStatusQueryOptions(gateway, gatewayReference ?? '', open && phase === 'processing' && !!gatewayReference)
  );

  useEffect(() => {
    if (statusQuery.data?.paid && gatewayReference) {
      setPhase('succeeded');
      popupRef.current?.close();
      onSuccess({ gateway_reference: gatewayReference, gateway_status: statusQuery.data.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusQuery.data]);

  function handleStripePaid(paymentIntentId: string, status: string) {
    setPhase('succeeded');
    onSuccess({ gateway_reference: paymentIntentId, gateway_status: status });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {gateway === 'stripe' && <Icons.gatewayStripe className='h-5 w-5' />}
            {(gateway === 'mpesa' || gateway === 'mtnmomo') && <Icons.gatewayMobileMoney className='h-5 w-5' />}
            {gateway === 'razorpay' && <Icons.creditCard className='h-5 w-5' />}
            {gateway === 'payhere' && <Icons.externalLink className='h-5 w-5' />}
            {label}
          </DialogTitle>
          <DialogDescription>Collecting {amountLabel} via {label}.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='bg-muted flex items-center justify-between rounded-md p-3'>
            <span className='text-sm font-medium'>Amount</span>
            <span className='text-lg font-bold'>{amountLabel}</span>
          </div>

          {phase === 'phone' && (
            <Field>
              <FieldLabel>Customer phone number</FieldLabel>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='e.g. 2547XXXXXXXX'
                autoFocus
              />
              <p className='text-muted-foreground text-xs'>
                We&apos;ll send a payment prompt to this number. The customer approves it on their phone.
              </p>
            </Field>
          )}

          {phase === 'initiating' && (
            <div className='flex flex-col items-center gap-2 py-6'>
              <Spinner className='size-6' />
              <p className='text-muted-foreground text-sm'>Starting the {label} payment…</p>
            </div>
          )}

          {phase === 'card' && initiateResult?.gateway === 'stripe' && (
            <Elements
              stripe={getStripePromise((initiateResult as StripeGatewayInitiateResponse).publishable_key)}
              options={{ clientSecret: (initiateResult as StripeGatewayInitiateResponse).client_secret }}
            >
              <StripePaymentForm
                amountLabel={amountLabel}
                onPaid={handleStripePaid}
                onProcessing={() => setPhase('processing')}
                onFailed={(message) => {
                  setErrorMessage(message);
                  setPhase('failed');
                }}
              />
            </Elements>
          )}

          {phase === 'processing' && (
            <div className='flex flex-col items-center gap-2 py-6 text-center'>
              <Spinner className='size-6' />
              {gateway === 'mpesa' && (
                <p className='text-sm'>
                  {(initiateResult as MpesaGatewayInitiateResponse | null)?.customer_message ??
                    'Check the customer’s phone and approve the M-Pesa prompt.'}
                </p>
              )}
              {gateway === 'mtnmomo' && (
                <p className='text-sm'>Ask the customer to approve the MTN MoMo request on their phone.</p>
              )}
              {gateway === 'razorpay' && <p className='text-sm'>Waiting for the Razorpay checkout to complete…</p>}
              {gateway === 'payhere' && (
                <p className='text-sm'>Complete the payment in the PayHere window. We&apos;ll pick it up automatically once confirmed.</p>
              )}
              <p className='text-muted-foreground text-xs'>Waiting for confirmation — this updates automatically.</p>
            </div>
          )}

          {phase === 'succeeded' && (
            <div className='flex flex-col items-center gap-2 py-6 text-emerald-600'>
              <Icons.check className='h-8 w-8' />
              <p className='text-sm font-medium'>Payment confirmed</p>
            </div>
          )}

          {phase === 'failed' && (
            <div className='flex flex-col items-center gap-2 py-6 text-center text-red-600'>
              <Icons.close className='h-8 w-8' />
              <p className='text-sm font-medium'>{errorMessage ?? 'The payment could not be completed.'}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {phase === 'succeeded' ? 'Close' : 'Cancel'}
          </Button>
          {phase === 'phone' && (
            <LoadingButton
              loading={initiateMutation.isPending}
              type='button'
              disabled={!phone.trim()}
              onClick={() => runInitiate(phone.trim())}
            >
              Send Payment Request
            </LoadingButton>
          )}
          {phase === 'failed' && (
            <Button type='button' onClick={() => setPhase(needsPhone ? 'phone' : 'initiating')}>
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
