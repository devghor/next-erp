<?php

namespace App\Models\Sale;

use App\Models\Settings\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    protected $fillable = [
        'company_id',
        'reference_no',
        'sale_id',
        'user_id',
        'courier_id',
        'address',
        'tracking_code',
        'delivered_by',
        'recieved_by',
        'file',
        'note',
        'status',
    ];

    protected $attributes = [
        'status' => 'packing',
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

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class, 'courier_id');
    }
}
