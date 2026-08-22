<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Currency extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'code',
        'symbol',
        'exchange_rate',
        'is_active',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'exchange_rate' => 1,
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
