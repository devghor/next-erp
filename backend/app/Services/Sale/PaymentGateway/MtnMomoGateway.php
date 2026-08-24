<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * MTN Mobile Money Collections API
 * (https://momodeveloper.mtn.com — Collection widget: request-to-pay + status).
 * No official composer SDK exists, so this talks to the documented REST contract
 * directly via the HTTP client. `mtnmomo_target_environment` (e.g. "sandbox" /
 * "mtnuganda") selects both the API host and the `X-Target-Environment` header.
 */
class MtnMomoGateway implements PaymentGatewayInterface
{
    use ResolvesGatewayContext;

    protected function baseUrl(): string
    {
        return $this->settings()->mtnmomo_target_environment === 'sandbox'
            ? 'https://sandbox.momodeveloper.mtn.com'
            : 'https://proxy.momoapi.mtn.com';
    }

    /**
     * @return array<string, string>
     */
    protected function headers(): array
    {
        return [
            'Ocp-Apim-Subscription-Key' => (string) $this->settings()->mtnmomo_subscription_key,
            'X-Target-Environment' => $this->settings()->mtnmomo_target_environment ?? 'sandbox',
        ];
    }

    protected function accessToken(): string
    {
        return Http::timeout(10)->connectTimeout(5)
            ->withBasicAuth($this->settings()->mtnmomo_api_user, $this->settings()->mtnmomo_api_key)
            ->withHeaders($this->headers())
            ->post("{$this->baseUrl()}/collection/token/")
            ->throw()
            ->json('access_token');
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function initiate(Sale|array $context): array
    {
        $reference = (string) Str::uuid();
        $phone = preg_replace('/\D/', '', (string) $this->phoneFrom($context)) ?: '';

        Http::timeout(15)->connectTimeout(5)
            ->withToken($this->accessToken())
            ->withHeaders(array_merge($this->headers(), ['X-Reference-Id' => $reference]))
            ->post("{$this->baseUrl()}/collection/v1_0/requesttopay", [
                'amount' => (string) $this->amountFrom($context),
                'currency' => $this->currencyFrom($context),
                'externalId' => $this->referenceFrom($context),
                'payer' => [
                    'partyIdType' => 'MSISDN',
                    'partyId' => $phone,
                ],
                'payerMessage' => 'POS Sale',
                'payeeNote' => 'POS Sale',
            ])
            ->throw();

        return [
            'gateway' => 'mtnmomo',
            'reference' => $reference,
            'gateway_reference' => $reference,
            'status' => 'pending',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function verify(string $reference): array
    {
        $response = Http::timeout(15)->connectTimeout(5)
            ->withToken($this->accessToken())
            ->withHeaders($this->headers())
            ->get("{$this->baseUrl()}/collection/v1_0/requesttopay/{$reference}")
            ->json();

        $status = strtoupper($response['status'] ?? 'PENDING');

        return [
            'gateway' => 'mtnmomo',
            'reference' => $reference,
            'status' => strtolower($status),
            'paid' => $status === 'SUCCESSFUL',
            'amount' => $response['amount'] ?? null,
        ];
    }
}
