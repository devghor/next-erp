<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;
use Illuminate\Support\Collection;
use Razorpay\Api\Api;

/**
 * Checkout payments via Razorpay Orders, using the official `razorpay/razorpay` SDK.
 * The frontend opens Razorpay's `checkout.js` with the returned `order_id`; `verify()`
 * then checks the order's captured payments server-side.
 */
class RazorpayGateway implements PaymentGatewayInterface
{
    use ResolvesGatewayContext;

    protected function client(): Api
    {
        return new Api($this->settings()->razorpay_key_id, $this->settings()->razorpay_key_secret);
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function initiate(Sale|array $context): array
    {
        $reference = $this->referenceFrom($context);

        $order = $this->client()->order->create([
            'receipt' => $reference,
            'amount' => (int) round($this->amountFrom($context) * 100),
            'currency' => $this->currencyFrom($context),
            'notes' => ['reference' => $reference],
        ])->toArray();

        return [
            'gateway' => 'razorpay',
            'reference' => $reference,
            'gateway_reference' => $order['id'],
            'order_id' => $order['id'],
            'key' => $this->settings()->razorpay_key_id,
            'amount' => $order['amount'],
            'currency' => $order['currency'],
            'status' => $order['status'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $reference): array
    {
        $payments = Collection::make($this->client()->order->fetch($reference)->payments()['items'] ?? []);
        $payment = $payments->first();

        return [
            'gateway' => 'razorpay',
            'reference' => $reference,
            'status' => $payment['status'] ?? 'created',
            'paid' => ($payment['status'] ?? null) === 'captured',
            'amount' => isset($payment['amount']) ? $payment['amount'] / 100 : null,
        ];
    }
}
