<?php

namespace App\Models\Sale;

use App\Models\Settings\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Courier extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'type',
        'phone_number',
        'address',
        'api_key',
        'secret_key',
        'client_id',
        'client_secret',
        'username',
        'password',
        'base_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'type' => 'manual',
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
