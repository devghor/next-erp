<?php

namespace App\Models\Sale;

use App\Models\People\Biller;
use App\Models\People\Customer;
use App\Models\Settings\Account;
use App\Models\Settings\Company;
use App\Models\Settings\Currency;
use App\Models\Settings\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaleReturn extends Model
{
    protected $table = 'sale_returns';

    protected $fillable = [
        'company_id',
        'reference_no',
        'sale_id',
        'customer_id',
        'warehouse_id',
        'biller_id',
        'account_id',
        'currency_id',
        'exchange_rate',
        'item',
        'total_qty',
        'total_discount',
        'total_tax',
        'total_price',
        'order_tax_rate',
        'order_tax',
        'grand_total',
        'refund_amount',
        'change_sale_status',
        'document',
        'return_note',
        'staff_note',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'total_qty' => 'decimal:4',
        'total_discount' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_price' => 'decimal:2',
        'order_tax_rate' => 'decimal:2',
        'order_tax' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'change_sale_status' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id');
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

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(SaleReturnProduct::class, 'return_id');
    }

    public function refundPayment(): HasMany
    {
        return $this->hasMany(Payment::class, 'return_id');
    }
}
