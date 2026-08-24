<?php

namespace App\Models\Settings;

use App\Models\People\Biller;
use App\Models\People\Customer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosSetting extends Model
{
    protected $fillable = [
        'company_id',
        'warehouse_id',
        'biller_id',
        'customer_id',
        'product_number',
        'keyboard_active',
        'cash_register_active',
        'show_print_invoice',
        'play_sound',
        'payment_options',
        'invoice_option',
        'thermal_invoice_size',
        'stripe_public_key',
        'stripe_secret_key',
        'razorpay_key_id',
        'razorpay_key_secret',
        'mpesa_consumer_key',
        'mpesa_consumer_secret',
        'mpesa_shortcode',
        'mpesa_passkey',
        'mtnmomo_subscription_key',
        'mtnmomo_api_user',
        'mtnmomo_api_key',
        'mtnmomo_target_environment',
        'payhere_merchant_id',
        'payhere_merchant_secret',
    ];

    protected $casts = [
        'product_number' => 'integer',
        'keyboard_active' => 'boolean',
        'cash_register_active' => 'boolean',
        'show_print_invoice' => 'boolean',
        'play_sound' => 'boolean',
        'payment_options' => 'array',
    ];

    protected $attributes = [
        'product_number' => 25,
        'keyboard_active' => false,
        'cash_register_active' => false,
        'show_print_invoice' => true,
        'play_sound' => true,
        'thermal_invoice_size' => '80mm',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function biller(): BelongsTo
    {
        return $this->belongsTo(Biller::class, 'biller_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }
}
