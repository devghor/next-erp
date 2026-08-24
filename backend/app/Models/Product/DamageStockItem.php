<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DamageStockItem extends Model
{
    protected $fillable = [
        'damage_stock_id',
        'product_id',
        'variant_id',
        'batch_id',
        'qty',
        'unit_cost',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'unit_cost' => 'decimal:2',
    ];

    public function damageStock(): BelongsTo
    {
        return $this->belongsTo(DamageStock::class, 'damage_stock_id');
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
}
