<?php

namespace App\Models\Sale;

use App\Models\Product\Product;
use App\Models\Product\ProductBatch;
use App\Models\Product\ProductVariant;
use App\Models\Product\Unit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSale extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'variant_id',
        'batch_id',
        'sale_unit_id',
        'qty',
        'return_qty',
        'net_unit_price',
        'discount',
        'tax_rate',
        'tax',
        'total',
        'is_packing',
        'is_delivered',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'return_qty' => 'decimal:4',
        'net_unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'is_packing' => 'boolean',
        'is_delivered' => 'boolean',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id');
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

    public function saleUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'sale_unit_id');
    }
}
