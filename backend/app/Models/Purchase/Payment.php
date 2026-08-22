<?php

namespace App\Models\Purchase;

use App\Models\Settings\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'company_id',
        'payment_reference',
        'purchase_id',
        'user_id',
        'account_id',
        'amount',
        'change',
        'paying_method',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'change' => 'decimal:2',
    ];

    protected $attributes = [
        'paying_method' => 'Cash',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
