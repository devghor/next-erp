<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Http\Controllers\Controller;
use App\Models\Settings\Company;
use App\Models\Settings\PosSetting;
use App\Services\Sale\PaymentGateway\MpesaGateway;
use App\Services\Sale\PaymentGateway\MtnMomoGateway;
use App\Services\Sale\PaymentGateway\PayHereGateway;
use App\Services\Sale\PaymentGateway\PaymentGatewayInterface;
use App\Services\Sale\PaymentGateway\RazorpayGateway;
use App\Services\Sale\PaymentGateway\StripeGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class PaymentGatewayController extends Controller
{
    /**
     * @var array<string, class-string<PaymentGatewayInterface>>
     */
    protected const GATEWAYS = [
        'stripe' => StripeGateway::class,
        'razorpay' => RazorpayGateway::class,
        'mpesa' => MpesaGateway::class,
        'mtnmomo' => MtnMomoGateway::class,
        'payhere' => PayHereGateway::class,
    ];

    protected function resolveGateway(string $gateway): PaymentGatewayInterface
    {
        if (! isset(self::GATEWAYS[$gateway])) {
            throw ValidationException::withMessages(['gateway' => "Unsupported payment gateway \"{$gateway}\"."]);
        }

        return app(self::GATEWAYS[$gateway]);
    }

    public function initiate(string $gateway, Request $request): Response
    {
        $context = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['nullable', 'string', 'max:10'],
            'reference' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);
        $context['reference'] ??= (string) Str::uuid();

        $result = $this->resolveGateway($gateway)->initiate($context);

        // callback()/status() below can run outside the auth:sanctum + tenancy
        // middleware and can't resolve tenant() on their own — remember which
        // company every reference this gateway hands back belongs to.
        foreach (array_filter([$result['reference'] ?? null, $result['gateway_reference'] ?? null]) as $key) {
            Cache::put("pos_gateway_ref:{$gateway}:{$key}", tenant()->id, now()->addHours(6));
        }

        return response()->json($result, 201);
    }

    /**
     * Public webhook/notify endpoint — deliberately outside auth:sanctum since
     * gateways can't send a Bearer token. Tenant is resolved from the reference
     * cached at initiate() time, the same way the reference itself was minted
     * inside an authenticated, tenancy-initialized request.
     */
    public function callback(string $gateway, Request $request): Response
    {
        $payload = $request->all();

        $reference = $payload['reference']
            ?? $payload['order_id']
            ?? $payload['externalId']
            ?? data_get($payload, 'Body.stkCallback.CheckoutRequestID')
            ?? data_get($payload, 'data.object.metadata.reference')
            ?? data_get($payload, 'data.object.id')
            ?? data_get($payload, 'payload.payment.entity.order_id');

        $companyId = $reference ? Cache::get("pos_gateway_ref:{$gateway}:{$reference}") : null;

        if ($companyId && ($company = Company::find($companyId))) {
            tenancy()->initialize($company);

            if ($gateway === 'payhere') {
                $this->cachePayHereStatus($request, (string) $reference);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * PayHere signs its notify payload with an md5 hash of the merchant secret —
     * verify it before trusting the status, then cache it for PayHereGateway::verify().
     */
    protected function cachePayHereStatus(Request $request, string $reference): void
    {
        $merchantSecret = PosSetting::query()->where('company_id', tenant()->id)->value('payhere_merchant_secret');

        $merchantId = (string) $request->input('merchant_id');
        $orderId = (string) $request->input('order_id');
        $amount = (string) $request->input('payhere_amount');
        $currency = (string) $request->input('payhere_currency');
        $statusCode = (string) $request->input('status_code');
        $signature = (string) $request->input('md5sig');

        $expectedSignature = strtoupper(md5(
            $merchantId.$orderId.$amount.$currency.$statusCode.strtoupper(md5((string) $merchantSecret))
        ));

        if (! hash_equals($expectedSignature, $signature)) {
            return;
        }

        Cache::put("payhere_status:{$reference}", [
            // PayHere status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargedback.
            'status' => $statusCode === '2' ? 'completed' : ($statusCode === '0' ? 'pending' : 'failed'),
            'amount' => $amount,
        ], now()->addHours(6));
    }

    public function status(string $gateway, string $reference): Response
    {
        return response()->json($this->resolveGateway($gateway)->verify($reference));
    }
}
