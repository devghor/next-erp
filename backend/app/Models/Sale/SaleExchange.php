<?php

namespace App\Models\Sale;

use App\Models\People\Biller;
use App\Models\People\Customer;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaleExchange extends Model
{
    protected $fillable = [
        'company_id',
        'sale_id',
        'reference_no',
        'customer_id',
        'user_id',
        'warehouse_id',
        'biller_id',
        'item',
        'total_qty',
        'total_discount',
        'total_tax',
        'amount',
        'payment_type',
        'order_tax_rate',
        'order_tax',
        'grand_total',
        'document',
        'exchange_note',
        'staff_note',
    ];

    protected $casts = [
        'total_qty' => 'decimal:4',
        'total_discount' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'amount' => 'decimal:2',
        'order_tax_rate' => 'decimal:2',
        'order_tax' => 'decimal:2',
        'grand_total' => 'decimal:2',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function biller(): BelongsTo
    {
        return $this->belongsTo(Biller::class, 'biller_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(ProductExchange::class, 'exchange_id');
    }

    public function newProducts(): HasMany
    {
        return $this->products()->where('type', 'new');
    }

    public function returnedProducts(): HasMany
    {
        return $this->products()->where('type', 'returned');
    }
}
