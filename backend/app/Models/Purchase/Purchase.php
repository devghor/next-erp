<?php

namespace App\Models\Purchase;

use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'reference_no',
        'supplier_id',
        'warehouse_id',
        'user_id',
        'status',
        'payment_status',
        'total_qty',
        'total_discount',
        'total_tax',
        'total_cost',
        'order_tax',
        'grand_total',
        'paid_amount',
        'note',
    ];

    protected $casts = [
        'total_qty' => 'decimal:4',
        'total_discount' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'order_tax' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    protected $attributes = [
        'status' => 'received',
        'payment_status' => 'due',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProductPurchase::class, 'purchase_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'purchase_id');
    }
}
