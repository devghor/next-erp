<?php

namespace App\Models\Product;

use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Adjustment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'reference_no',
        'warehouse_id',
        'user_id',
        'total_qty',
        'note',
    ];

    protected $casts = [
        'total_qty' => 'decimal:4',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
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
        return $this->hasMany(ProductAdjustment::class, 'adjustment_id');
    }
}
