<?php

namespace App\Services\Courier;

use App\Models\People\Customer;
use App\Models\Sale\Sale;

/**
 * Contract every third-party courier integration must implement.
 *
 * Delivery details are passed as a plain array rather than a `Delivery` model
 * so this abstraction has no compile-time dependency on the Delivery feature
 * (built in a later phase). Expected `$deliveryData` keys: `recipient_name`,
 * `recipient_phone`, `recipient_address`, `cod_amount` (float), `note` (optional).
 *
 * Both methods must never throw — wrap outbound HTTP calls in try/catch and
 * return `success=false` with an `error` message instead, so callers don't
 * need to know per-courier exception details.
 */
interface CourierInterface
{
    /**
     * @param  array{recipient_name: string, recipient_phone: string, recipient_address: string, cod_amount: float, note?: string|null}  $deliveryData
     * @return array{success: bool, tracking_code: ?string, status: ?string, error: ?string}
     */
    public function createOrder(array $deliveryData, Sale $sale, Customer $customer): array;

    /**
     * @return array{success: bool, tracking_code: ?string, status: ?string, error: ?string}
     */
    public function trackOrder(string $trackingCode): array;
}
