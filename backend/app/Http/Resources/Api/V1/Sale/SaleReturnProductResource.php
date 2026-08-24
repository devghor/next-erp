<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleReturnProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_sale_id' => $this->product_sale_id,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn () => $this->product?->name),
            'variant_id' => $this->variant_id,
            'batch_id' => $this->batch_id,
            'sale_unit_id' => $this->sale_unit_id,
            'qty' => (float) $this->qty,
            'net_unit_price' => (float) $this->net_unit_price,
            'discount' => (float) $this->discount,
            'tax_rate' => (float) $this->tax_rate,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
        ];
    }
}
