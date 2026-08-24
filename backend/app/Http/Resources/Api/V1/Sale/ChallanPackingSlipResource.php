<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChallanPackingSlipResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $sale = $this->packingSlip?->sale;

        return [
            'id' => $this->id,
            'challan_id' => $this->challan_id,
            'packing_slip_id' => $this->packing_slip_id,
            'packing_slip_reference_no' => $this->packingSlip?->reference_no,
            'sale_reference_no' => $sale?->reference_no,
            'customer_name' => $sale?->customer?->name,
            'sale_grand_total' => $sale ? (float) $sale->grand_total : null,
            'sale_due' => $sale ? max(0.0, (float) $sale->grand_total - (float) $sale->paid_amount) : null,
            'amount' => (float) $this->amount,
            'delivery_charge' => (float) $this->delivery_charge,
            'paid_amount' => (float) $this->paid_amount,
            'status' => $this->status,
        ];
    }
}
