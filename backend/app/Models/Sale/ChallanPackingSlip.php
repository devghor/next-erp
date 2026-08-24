<?php

namespace App\Models\Sale;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallanPackingSlip extends Model
{
    protected $fillable = [
        'challan_id',
        'packing_slip_id',
        'amount',
        'delivery_charge',
        'status',
        'paid_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    public function challan(): BelongsTo
    {
        return $this->belongsTo(Challan::class, 'challan_id');
    }

    public function packingSlip(): BelongsTo
    {
        return $this->belongsTo(PackingSlip::class, 'packing_slip_id');
    }
}
