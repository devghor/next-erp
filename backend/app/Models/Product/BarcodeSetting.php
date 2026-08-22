<?php

namespace App\Models\Product;

use App\Models\Settings\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarcodeSetting extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'description',
        'width',
        'height',
        'paper_width',
        'paper_height',
        'top_margin',
        'left_margin',
        'row_distance',
        'col_distance',
        'stickers_in_one_row',
        'stickers_in_one_sheet',
        'is_default',
    ];

    protected $casts = [
        'width' => 'float',
        'height' => 'float',
        'paper_width' => 'float',
        'paper_height' => 'float',
        'top_margin' => 'float',
        'left_margin' => 'float',
        'row_distance' => 'float',
        'col_distance' => 'float',
        'stickers_in_one_row' => 'integer',
        'stickers_in_one_sheet' => 'integer',
        'is_default' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
