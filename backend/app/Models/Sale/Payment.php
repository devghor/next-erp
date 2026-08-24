<?php

namespace App\Models\Sale;

use App\Models\Settings\Account;
use App\Models\Settings\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $table = 'sale_payments';

    protected $fillable = [
        'company_id',
        'payment_reference',
        'sale_id',
        'return_id',
        'installment_id',
        'gift_card_id',
        'user_id',
        'account_id',
        'amount',
        'change',
        'paying_method',
        'cheque_no',
        'payment_note',
        'gateway_reference',
        'gateway_status',
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

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
