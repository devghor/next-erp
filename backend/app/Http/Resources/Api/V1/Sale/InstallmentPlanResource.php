<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class InstallmentPlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $installments = $this->whenLoaded('installments');
        $paidCount = $installments instanceof Collection
            ? $installments->where('status', 'completed')->count()
            : null;

        return [
            'id' => $this->id,
            'sale_id' => $this->sale_id,
            'sale_reference_no' => $this->whenLoaded('sale', fn () => $this->sale?->reference_no),
            'customer_name' => $this->whenLoaded('sale', fn () => $this->sale?->customer?->name),
            'name' => $this->name,
            'price' => (float) $this->price,
            'additional_amount' => (float) $this->additional_amount,
            'total_amount' => (float) $this->total_amount,
            'down_payment' => (float) $this->down_payment,
            'months' => $this->months,
            'paid_count' => $paidCount,
            'installments' => InstallmentResource::collection($installments),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
