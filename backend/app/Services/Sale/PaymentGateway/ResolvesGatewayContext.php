<?php

namespace App\Services\Sale\PaymentGateway;

use App\Models\Sale\Sale;
use App\Models\Settings\PosSetting;
use Illuminate\Support\Str;

/**
 * Shared helpers for reading tenant gateway credentials and normalizing the
 * `Sale|array` payload every gateway's `initiate()` accepts.
 */
trait ResolvesGatewayContext
{
    protected function settings(): PosSetting
    {
        return PosSetting::query()->where('company_id', tenant()->id)->first() ?? new PosSetting;
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     */
    protected function amountFrom(Sale|array $context): float
    {
        return (float) ($context instanceof Sale ? $context->grand_total : ($context['amount'] ?? 0));
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     */
    protected function currencyFrom(Sale|array $context): string
    {
        $currency = $context instanceof Sale
            ? $context->currency?->code
            : ($context['currency'] ?? null);

        return strtoupper($currency ?: 'USD');
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     */
    protected function referenceFrom(Sale|array $context): string
    {
        if ($context instanceof Sale) {
            return $context->reference_no;
        }

        return $context['reference'] ?? (string) Str::uuid();
    }

    /**
     * @param  Sale|array<string, mixed>  $context
     */
    protected function phoneFrom(Sale|array $context): ?string
    {
        if ($context instanceof Sale) {
            return $context->customer?->phone;
        }

        return $context['phone'] ?? null;
    }
}
