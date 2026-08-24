<?php

namespace App\Models\Sale;

use App\Models\Settings\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PackingSlip extends Model
{
    protected $fillable = [
        'company_id',
        'reference_no',
        'sale_id',
        'delivery_id',
        'amount',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(PackingSlipProduct::class, 'packing_slip_id');
    }
}
