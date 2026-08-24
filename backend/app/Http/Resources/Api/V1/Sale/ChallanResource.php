<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class ChallanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $slips = $this->whenLoaded('packingSlips');
        $totalAmount = $slips instanceof Collection || is_iterable($slips)
            ? collect($slips)->sum(fn ($row) => (float) $row->amount)
            : 0.0;
        $totalDue = $slips instanceof Collection || is_iterable($slips)
            ? collect($slips)->sum(fn ($row) => $row->status === 'pending' ? max(0.0, (float) $row->amount - (float) $row->paid_amount) : 0.0)
            : 0.0;

        return [
            'id' => $this->id,
            'reference_no' => $this->reference_no,
            'courier_id' => $this->courier_id,
            'courier_name' => $this->whenLoaded('courier', fn () => $this->courier?->name),
            'status' => $this->status,
            'closing_date' => $this->closing_date,
            'created_by_name' => $this->whenLoaded('createdBy', fn () => $this->createdBy?->name),
            'closed_by_name' => $this->whenLoaded('closedBy', fn () => $this->closedBy?->name),
            'total_amount' => $totalAmount,
            'total_due' => $totalDue,
            'packing_slips' => ChallanPackingSlipResource::collection($slips),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
