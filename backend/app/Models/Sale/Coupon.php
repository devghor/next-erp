<?php

namespace App\Models\Sale;

use App\Models\Settings\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    protected $fillable = [
        'company_id',
        'code',
        'name',
        'type',
        'amount',
        'minimum_amount',
        'quantity',
        'used',
        'expired_date',
        'user_id',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'quantity' => 'integer',
        'used' => 'integer',
        'expired_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'type' => 'fixed',
        'minimum_amount' => 0,
        'quantity' => 0,
        'used' => 0,
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
