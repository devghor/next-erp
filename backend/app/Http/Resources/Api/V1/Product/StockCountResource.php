<?php

namespace App\Http\Resources\Api\V1\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockCountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_no' => $this->reference_no,
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->whenLoaded('warehouse', fn () => $this->warehouse?->name),
            'user_id' => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'adjustment_id' => $this->adjustment_id,
            'type' => $this->type,
            'status' => $this->status,
            'category_ids' => $this->category_ids,
            'brand_ids' => $this->brand_ids,
            'note' => $this->note,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'product_code' => $item->product?->code,
                'variant_id' => $item->variant_id,
                'batch_id' => $item->batch_id,
                'expected_qty' => $item->expected_qty,
                'counted_qty' => $item->counted_qty,
                'difference' => $item->difference,
                'unit_cost' => $item->unit_cost,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
