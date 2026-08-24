<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    /**
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
            'courier_id' => $this->courier_id,
            'courier_name' => $this->whenLoaded('courier', fn () => $this->courier?->name),
            'courier_type' => $this->whenLoaded('courier', fn () => $this->courier?->type),
            'user_id' => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'address' => $this->address,
            'tracking_code' => $this->tracking_code,
            'delivered_by' => $this->delivered_by,
            'recieved_by' => $this->recieved_by,
            'note' => $this->note,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
