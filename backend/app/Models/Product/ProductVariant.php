<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'variant_id',
        'item_code',
        'additional_cost',
        'additional_price',
        'position',
        'is_active',
    ];

    protected $casts = [
        'additional_cost' => 'decimal:2',
        'additional_price' => 'decimal:2',
        'position' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(Variant::class, 'variant_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ProductWarehouse::class, 'variant_id');
    }
}
