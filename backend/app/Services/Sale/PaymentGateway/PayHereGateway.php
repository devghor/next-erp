<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Cache;

/**
 * PayHere's Hosted Checkout (https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout)
 * is a redirect/form-post flow authorized by an MD5 hash of the merchant secret —
 * there is no REST call to "start" a payment. `initiate()` returns the signed
 * checkout params the frontend posts to PayHere's hosted page.
 *
 * PayHere has no public poll-by-reference status endpoint under the merchant_id/
 * merchant_secret credentials collected here (that requires separate OAuth app
 * credentials PosSetting doesn't store) — status instead arrives asynchronously
 * at the `notify_url` server-to-server callback, which PaymentGatewayController
 * verifies (recomputing the md5 signature) and caches. `verify()` reads that
 * cached status, so it only reflects reality once PayHere has called back.
 */
class PayHereGateway implements PaymentGatewayInterface
{
    use ResolvesGatewayContext;

    protected function checkoutUrl(): string
    {
        return 'https://sandbox.payhere.lk/pay/checkout';
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function initiate(Sale|array $context): array
    {
        $reference = $this->referenceFrom($context);
        $merchantId = (string) $this->settings()->payhere_merchant_id;
        $merchantSecret = (string) $this->settings()->payhere_merchant_secret;
        $amount = number_format($this->amountFrom($context), 2, '.', '');
        $currency = $this->currencyFrom($context);

        $hash = strtoupper(md5(
            $merchantId.$reference.$amount.$currency.strtoupper(md5($merchantSecret))
        ));

        return [
            'gateway' => 'payhere',
            'reference' => $reference,
            'gateway_reference' => $reference,
            'action_url' => $this->checkoutUrl(),
            'merchant_id' => $merchantId,
            'order_id' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'hash' => $hash,
            'status' => 'pending',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $reference): array
    {
        $cached = Cache::get("payhere_status:{$reference}");

        return [
            'gateway' => 'payhere',
            'reference' => $reference,
            'status' => $cached['status'] ?? 'pending',
            'paid' => ($cached['status'] ?? null) === 'completed',
            'amount' => $cached['amount'] ?? null,
        ];
    }
}
