<?php

namespace App\Http\Resources\Api\V1\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarcodeSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'width' => $this->width,
            'height' => $this->height,
            'paper_width' => $this->paper_width,
            'paper_height' => $this->paper_height,
            'top_margin' => $this->top_margin,
            'left_margin' => $this->left_margin,
            'row_distance' => $this->row_distance,
            'col_distance' => $this->col_distance,
            'stickers_in_one_row' => $this->stickers_in_one_row,
            'stickers_in_one_sheet' => $this->stickers_in_one_sheet,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
