<?php

namespace App\Models\Product;

use App\Models\Settings\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Variant extends Model
{
    protected $fillable = [
        'company_id',
        'name',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function productVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'variant_id');
    }
}
