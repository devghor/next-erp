<?php

namespace App\Models\Sale;

use App\Models\Product\Product;
use App\Models\Product\ProductBatch;
use App\Models\Product\ProductVariant;
use App\Models\Product\Unit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleReturnProduct extends Model
{
    protected $table = 'sale_return_products';

    protected $fillable = [
        'return_id',
        'product_sale_id',
        'product_id',
        'variant_id',
        'batch_id',
        'sale_unit_id',
        'qty',
        'net_unit_price',
        'discount',
        'tax_rate',
        'tax',
        'total',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'net_unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class, 'return_id');
    }

    public function productSale(): BelongsTo
    {
        return $this->belongsTo(ProductSale::class, 'product_sale_id');
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
