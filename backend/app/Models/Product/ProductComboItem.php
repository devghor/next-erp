<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductComboItem extends Model
{
    protected $fillable = [
        'combo_product_id',
        'component_product_id',
        'component_variant_id',
        'unit_id',
        'qty',
        'unit_price',
        'wastage_percent',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'wastage_percent' => 'decimal:2',
    ];

    public function comboProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'combo_product_id');
    }

    public function componentProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'component_product_id');
    }

    public function componentVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'component_variant_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
