<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackingSlipResource extends JsonResource
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
            'sale_id' => $this->sale_id,
            'sale_reference_no' => $this->whenLoaded('sale', fn () => $this->sale?->reference_no),
            'customer_name' => $this->whenLoaded('sale', fn () => $this->sale?->customer?->name),
            'delivery_id' => $this->delivery_id,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'products' => PackingSlipProductResource::collection($this->whenLoaded('products')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
