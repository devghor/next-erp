<?php

namespace App\Models\People;

use App\Models\Settings\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'company_name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'tax_number',
        'credit_limit',
        'opening_balance',
        'deposit',
        'points',
        'is_active',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'opening_balance' => 'decimal:2',
        'deposit' => 'decimal:2',
        'points' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
