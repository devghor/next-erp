<?php

namespace App\Models\Sale;

use App\Models\People\Biller;
use App\Models\People\Customer;
use App\Models\Settings\Company;
use App\Models\Settings\Currency;
use App\Models\Settings\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'reference_no',
        'customer_id',
        'warehouse_id',
        'biller_id',
        'user_id',
        'currency_id',
        'exchange_rate',
        'item',
        'total_qty',
        'total_discount',
        'total_tax',
        'total_price',
        'order_tax_rate',
        'order_tax',
        'order_discount_type',
        'order_discount_value',
        'order_discount',
        'coupon_id',
        'coupon_discount',
        'shipping_cost',
        'grand_total',
        'paid_amount',
        'sale_status',
        'payment_status',
        'pay_term_no',
        'pay_term_period',
        'due_date',
        'document',
        'sale_note',
        'staff_note',
        'deleted_by',
        'is_pos',
        'cash_register_id',
        'client_reference',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'total_qty' => 'decimal:4',
        'total_discount' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_price' => 'decimal:2',
        'order_tax_rate' => 'decimal:2',
        'order_tax' => 'decimal:2',
        'order_discount_value' => 'decimal:2',
        'order_discount' => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
        'is_pos' => 'boolean',
    ];

    protected $attributes = [
        'sale_status' => 'draft',
        'payment_status' => 'due',
        'order_discount_type' => 'fixed',
        'is_pos' => false,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function biller(): BelongsTo
    {
        return $this->belongsTo(Biller::class, 'biller_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by')->withDefault(['name' => 'System']);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProductSale::class, 'sale_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'sale_id');
    }

    public function installmentPlan(): HasOne
    {
        return $this->hasOne(InstallmentPlan::class, 'sale_id');
    }

    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }
}
