<?php

namespace App\Models\Product;

use App\Models\Settings\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $fillable = [
        'company_id',
        'code',
        'name',
        'base_unit_id',
        'operator',
        'operation_value',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'operation_value' => 'decimal:4',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function baseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'base_unit_id');
    }

    public function derivedUnits(): HasMany
    {
        return $this->hasMany(Unit::class, 'base_unit_id');
    }
}
