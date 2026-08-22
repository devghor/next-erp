<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomField extends Model
{
    protected $fillable = [
        'company_id',
        'belongs_to',
        'name',
        'type',
        'options',
        'is_table',
        'is_required',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'is_table' => 'boolean',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_table' => false,
        'is_required' => false,
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(CustomFieldValue::class, 'custom_field_id');
    }
}
