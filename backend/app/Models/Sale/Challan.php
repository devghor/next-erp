<?php

namespace App\Models\Sale;

use App\Models\Settings\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challan extends Model
{
    protected $fillable = [
        'company_id',
        'reference_no',
        'courier_id',
        'status',
        'closing_date',
        'created_by_id',
        'closed_by_id',
    ];

    protected $casts = [
        'closing_date' => 'date',
    ];

    protected $attributes = [
        'status' => 'active',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class, 'courier_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by_id');
    }

    public function packingSlips(): HasMany
    {
        return $this->hasMany(ChallanPackingSlip::class, 'challan_id');
    }
}
