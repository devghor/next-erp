<?php

namespace App\Models\Product;

use App\Enums\Media\MediaCollectionEnum;
use App\Models\Settings\Company;
use App\Models\Settings\CustomFieldValue;
use App\Models\Settings\Tax;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(MediaCollectionEnum::ProductProductsImage->value)
            ->useDisk('private');
    }

    protected $fillable = [
        'company_id',
        'category_id',
        'brand_id',
        'unit_id',
        'purchase_unit_id',
        'sale_unit_id',
        'tax_id',
        'name',
        'code',
        'type',
        'cost',
        'price',
        'wholesale_price',
        'min_wholesale_qty',
        'tax_method',
        'alert_quantity',
        'has_warranty',
        'warranty_value',
        'warranty_type',
        'has_guarantee',
        'guarantee_value',
        'guarantee_type',
        'starting_date',
        'last_date',
        'is_variant',
        'is_imei',
        'is_batch',
        'is_recipe',
        'variant_option',
        'variant_value',
        'wastage_percent',
        'profit_margin',
        'product_details',
        'is_active',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'min_wholesale_qty' => 'decimal:4',
        'alert_quantity' => 'decimal:4',
        'has_warranty' => 'boolean',
        'has_guarantee' => 'boolean',
        'starting_date' => 'date',
        'last_date' => 'date',
        'is_variant' => 'boolean',
        'is_imei' => 'boolean',
        'is_batch' => 'boolean',
        'is_recipe' => 'boolean',
        'variant_option' => 'array',
        'variant_value' => 'array',
        'wastage_percent' => 'decimal:2',
        'profit_margin' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'type' => 'standard',
        'tax_method' => 1,
        'is_active' => true,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function purchaseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'purchase_unit_id');
    }

    public function saleUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'sale_unit_id');
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class, 'tax_id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id')->orderBy('position');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class, 'product_id');
    }

    public function comboItems(): HasMany
    {
        return $this->hasMany(ProductComboItem::class, 'combo_product_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(ProductWarehouse::class, 'product_id');
    }

    public function customFieldValues(): HasMany
    {
        return $this->hasMany(CustomFieldValue::class, 'product_id');
    }
}
