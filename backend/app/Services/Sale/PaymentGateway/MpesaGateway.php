<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * M-Pesa STK Push via Safaricom's Daraja API
 * (https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate). No official
 * composer SDK exists, so this talks to the documented REST contract directly
 * via the HTTP client.
 */
class MpesaGateway implements PaymentGatewayInterface
{
    use ResolvesGatewayContext;

    protected function baseUrl(): string
    {
        return 'https://api.safaricom.co.ke';
    }

    protected function accessToken(): string
    {
        return Cache::remember(
            'mpesa_access_token:'.tenant()->id,
            now()->addMinutes(55),
            fn () => Http::timeout(10)->connectTimeout(5)
                ->withBasicAuth($this->settings()->mpesa_consumer_key, $this->settings()->mpesa_consumer_secret)
                ->get("{$this->baseUrl()}/oauth/v1/generate", ['grant_type' => 'client_credentials'])
                ->throw()
                ->json('access_token'),
        );
    }

    protected function password(string $timestamp): string
    {
        return base64_encode($this->settings()->mpesa_shortcode.$this->settings()->mpesa_passkey.$timestamp);
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function initiate(Sale|array $context): array
    {
        $reference = $this->referenceFrom($context);
        $timestamp = now()->format('YmdHis');
        $shortcode = $this->settings()->mpesa_shortcode;
        $phone = preg_replace('/\D/', '', (string) $this->phoneFrom($context)) ?: '';

        $response = Http::timeout(15)->connectTimeout(5)
            ->withToken($this->accessToken())
            ->post("{$this->baseUrl()}/mpesa/stkpush/v1/processrequest", [
                'BusinessShortCode' => $shortcode,
                'Password' => $this->password($timestamp),
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => (int) round($this->amountFrom($context)),
                'PartyA' => $phone,
                'PartyB' => $shortcode,
                'PhoneNumber' => $phone,
                'CallBackURL' => route('v1.sale.pos.gateways.callback', ['gateway' => 'mpesa']),
                'AccountReference' => $reference,
                'TransactionDesc' => 'POS Sale',
            ])
            ->throw()
            ->json();

        return [
            'gateway' => 'mpesa',
            'reference' => $reference,
            'gateway_reference' => $response['CheckoutRequestID'] ?? null,
            'merchant_request_id' => $response['MerchantRequestID'] ?? null,
            'response_code' => $response['ResponseCode'] ?? null,
            'customer_message' => $response['CustomerMessage'] ?? null,
            'status' => 'pending',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $reference): array
    {
        $timestamp = now()->format('YmdHis');

        $response = Http::timeout(15)->connectTimeout(5)
            ->withToken($this->accessToken())
            ->post("{$this->baseUrl()}/mpesa/stkpushquery/v1/query", [
                'BusinessShortCode' => $this->settings()->mpesa_shortcode,
                'Password' => $this->password($timestamp),
                'Timestamp' => $timestamp,
                'CheckoutRequestID' => $reference,
            ])
            ->json();

        $resultCode = $response['ResultCode'] ?? null;
        $completed = in_array($resultCode, [0, '0'], true);

        return [
            'gateway' => 'mpesa',
            'reference' => $reference,
            'status' => $resultCode === null ? 'pending' : ($completed ? 'completed' : 'failed'),
            'paid' => $completed,
            'result_desc' => $response['ResultDesc'] ?? null,
        ];
    }
}
