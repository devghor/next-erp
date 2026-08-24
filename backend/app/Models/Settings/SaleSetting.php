<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleSetting extends Model
{
    protected $fillable = [
        'company_id',
        'reward_points_active',
        'per_point_amount',
        'min_order_for_points',
        'point_expiry_days',
        'default_account_id',
    ];

    protected $casts = [
        'reward_points_active' => 'boolean',
        'per_point_amount' => 'decimal:2',
        'min_order_for_points' => 'decimal:2',
    ];

    protected $attributes = [
        'reward_points_active' => false,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
