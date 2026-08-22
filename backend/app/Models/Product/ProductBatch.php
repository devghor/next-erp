<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductBatch extends Model
{
    protected $fillable = [
        'product_id',
        'batch_no',
        'expired_date',
        'is_active',
    ];

    protected $casts = [
        'expired_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ProductWarehouse::class, 'batch_id');
    }
}
