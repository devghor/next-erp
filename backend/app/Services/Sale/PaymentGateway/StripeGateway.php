<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;
use Stripe\StripeClient;

/**
 * Card payments via Stripe PaymentIntents, using the official `stripe/stripe-php` SDK.
 * The frontend confirms the PaymentIntent client-side (Stripe Elements) using the
 * `client_secret` this returns; `verify()`/the status poll then re-reads the
 * PaymentIntent's server-side status.
 */
class StripeGateway implements PaymentGatewayInterface
{
    use ResolvesGatewayContext;

    protected function client(): StripeClient
    {
        return new StripeClient($this->settings()->stripe_secret_key);
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function initiate(Sale|array $context): array
    {
        $reference = $this->referenceFrom($context);

        $paymentIntent = $this->client()->paymentIntents->create([
            'amount' => (int) round($this->amountFrom($context) * 100),
            'currency' => strtolower($this->currencyFrom($context)),
            'metadata' => ['reference' => $reference],
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return [
            'gateway' => 'stripe',
            'reference' => $reference,
            'gateway_reference' => $paymentIntent->id,
            'client_secret' => $paymentIntent->client_secret,
            'publishable_key' => $this->settings()->stripe_public_key,
            'status' => $paymentIntent->status,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $reference): array
    {
        $paymentIntent = $this->client()->paymentIntents->retrieve($reference);

        return [
            'gateway' => 'stripe',
            'reference' => $reference,
            'gateway_reference' => $paymentIntent->id,
            'status' => $paymentIntent->status,
            'paid' => $paymentIntent->status === 'succeeded',
            'amount' => $paymentIntent->amount / 100,
        ];
    }
}
