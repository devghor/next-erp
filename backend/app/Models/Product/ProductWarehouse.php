<?php

namespace App\Models\Product;

use App\Models\Settings\Warehouse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductWarehouse extends Model
{
    protected $fillable = [
        'product_id',
        'variant_id',
        'batch_id',
        'warehouse_id',
        'qty',
        'price',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'price' => 'decimal:2',
    ];

    protected $attributes = [
        'qty' => 0,
    ];

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

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }
}
