<?php

namespace App\Models\Sale;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftCardRecharge extends Model
{
    protected $fillable = [
        'gift_card_id',
        'amount',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function giftCard(): BelongsTo
    {
        return $this->belongsTo(GiftCard::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
