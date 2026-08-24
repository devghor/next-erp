<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Models\Settings\PosSetting;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Validation\Rule;

class PosSettingController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ReadSalePosSettings->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSalePosSettings->value, only: ['update']),
        ];
    }

    public function show(): PosSetting
    {
        return PosSetting::query()->firstOrCreate(['company_id' => tenant()->id]);
    }

    public function update(Request $request): PosSetting
    {
        $data = $request->validate([
            'warehouse_id' => [
                'nullable', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'biller_id' => [
                'nullable', 'integer',
                Rule::exists('billers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'customer_id' => [
                'nullable', 'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'product_number' => ['nullable', 'integer', 'min:1'],
            'keyboard_active' => ['nullable', 'boolean'],
            'cash_register_active' => ['nullable', 'boolean'],
            'show_print_invoice' => ['nullable', 'boolean'],
            'play_sound' => ['nullable', 'boolean'],
            'payment_options' => ['nullable', 'array'],
            'payment_options.*' => ['string'],
            'invoice_option' => ['nullable', 'string', 'max:255'],
            'thermal_invoice_size' => ['nullable', 'in:58mm,80mm'],
            'stripe_public_key' => ['nullable', 'string'],
            'stripe_secret_key' => ['nullable', 'string'],
            'razorpay_key_id' => ['nullable', 'string'],
            'razorpay_key_secret' => ['nullable', 'string'],
            'mpesa_consumer_key' => ['nullable', 'string'],
            'mpesa_consumer_secret' => ['nullable', 'string'],
            'mpesa_shortcode' => ['nullable', 'string'],
            'mpesa_passkey' => ['nullable', 'string'],
            'mtnmomo_subscription_key' => ['nullable', 'string'],
            'mtnmomo_api_user' => ['nullable', 'string'],
            'mtnmomo_api_key' => ['nullable', 'string'],
            'mtnmomo_target_environment' => ['nullable', 'string'],
            'payhere_merchant_id' => ['nullable', 'string'],
            'payhere_merchant_secret' => ['nullable', 'string'],
        ]);

        $setting = PosSetting::query()->firstOrCreate(['company_id' => tenant()->id]);
        $setting->update($data);

        return $setting;
    }
}
