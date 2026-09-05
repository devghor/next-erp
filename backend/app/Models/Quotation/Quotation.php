<?php

namespace App\Models\Quotation;

use App\Enums\Media\MediaCollectionEnum;
use App\Models\People\Biller;
use App\Models\People\Customer;
use App\Models\People\Supplier;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Quotation extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(MediaCollectionEnum::QuotationQuotationsDocument->value)
            ->useDisk('private')
            ->singleFile();
    }

    protected $fillable = [
        'company_id',
        'reference_no',
        'customer_id',
        'warehouse_id',
        'biller_id',
        'supplier_id',
        'user_id',
        'item',
        'total_qty',
        'total_discount',
        'total_tax',
        'total_price',
        'order_tax_rate',
        'order_tax',
        'order_discount',
        'shipping_cost',
        'grand_total',
        'quotation_status',
        'note',
    ];

    protected $casts = [
        'total_qty' => 'decimal:4',
        'total_discount' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_price' => 'decimal:2',
        'order_tax_rate' => 'decimal:2',
        'order_tax' => 'decimal:2',
        'order_discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    protected $attributes = [
        'quotation_status' => 'pending',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function biller(): BelongsTo
    {
        return $this->belongsTo(Biller::class, 'biller_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProductQuotation::class, 'quotation_id');
    }
}
