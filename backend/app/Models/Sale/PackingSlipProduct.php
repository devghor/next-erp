<?php

namespace App\Models\Sale;

use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackingSlipProduct extends Model
{
    protected $fillable = [
        'packing_slip_id',
        'product_id',
        'variant_id',
    ];

    public function packingSlip(): BelongsTo
    {
        return $this->belongsTo(PackingSlip::class, 'packing_slip_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
