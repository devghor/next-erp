<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;

interface PaymentGatewayInterface
{
    /**
     * Start a payment with the gateway and return everything the frontend needs
     * to complete it (client secret / checkout params / redirect URL, plus the
     * `reference` this payment can later be polled or verified with).
     *
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public function initiate(Sale|array $context): array;

    /**
     * Check the current status of a previously-initiated payment.
     *
     * @return array<string, mixed>
     */
    public function verify(string $reference): array;
}
