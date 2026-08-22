<?php

namespace App\Models\Purchase;

use App\Models\Product\Product;
use App\Models\Product\ProductBatch;
use App\Models\Product\ProductVariant;
use App\Models\Product\Unit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPurchase extends Model
{
    protected $fillable = [
        'purchase_id',
        'product_id',
        'variant_id',
        'batch_id',
        'purchase_unit_id',
        'qty',
        'received',
        'net_unit_cost',
        'discount',
        'tax_rate',
        'tax',
        'total',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'received' => 'decimal:4',
        'net_unit_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'purchase_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(ProductBatch::class, 'batch_id');
    }

    public function purchaseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'purchase_unit_id');
    }
}
