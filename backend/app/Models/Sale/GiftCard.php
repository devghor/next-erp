<?php

namespace App\Models\Sale;

use App\Models\People\Customer;
use App\Models\Settings\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GiftCard extends Model
{
    protected $fillable = [
        'company_id',
        'card_no',
        'amount',
        'expense',
        'customer_id',
        'user_id',
        'expired_date',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense' => 'decimal:2',
        'expired_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'amount' => 0,
        'expense' => 0,
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recharges(): HasMany
    {
        return $this->hasMany(GiftCardRecharge::class);
    }
}
