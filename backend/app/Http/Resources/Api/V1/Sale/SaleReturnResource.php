<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleReturnResource extends JsonResource
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
            'customer_id' => $this->customer_id,
            'customer_name' => $this->whenLoaded('customer', fn () => $this->customer?->name),
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->whenLoaded('warehouse', fn () => $this->warehouse?->name),
            'biller_id' => $this->biller_id,
            'biller_name' => $this->whenLoaded('biller', fn () => $this->biller?->name),
            'account_id' => $this->account_id,
            'currency_id' => $this->currency_id,
            'exchange_rate' => (float) $this->exchange_rate,
            'item' => $this->item,
            'total_qty' => (float) $this->total_qty,
            'total_discount' => (float) $this->total_discount,
            'total_tax' => (float) $this->total_tax,
            'total_price' => (float) $this->total_price,
            'grand_total' => (float) $this->grand_total,
            'refund_amount' => (float) $this->refund_amount,
            'change_sale_status' => (bool) $this->change_sale_status,
            'document' => $this->document,
            'return_note' => $this->return_note,
            'staff_note' => $this->staff_note,
            'products' => SaleReturnProductResource::collection($this->whenLoaded('products')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
