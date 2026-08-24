<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstallmentPlan extends Model
{
    protected $table = 'sale_installment_plans';

    protected $fillable = [
        'sale_id',
        'name',
        'price',
        'additional_amount',
        'total_amount',
        'down_payment',
        'months',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'additional_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'months' => 'integer',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class, 'installment_plan_id');
    }
}
