<?php

namespace App\Http\Resources\Api\V1\Purchase;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
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
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->whenLoaded('supplier', fn () => $this->supplier?->name),
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->whenLoaded('warehouse', fn () => $this->warehouse?->name),
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'total_qty' => $this->total_qty,
            'total_discount' => $this->total_discount,
            'total_tax' => $this->total_tax,
            'total_cost' => $this->total_cost,
            'order_tax' => $this->order_tax,
            'grand_total' => $this->grand_total,
            'paid_amount' => $this->paid_amount,
            'due_amount' => (float) $this->grand_total - (float) $this->paid_amount,
            'note' => $this->note,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'variant_id' => $item->variant_id,
                'batch_id' => $item->batch_id,
                'purchase_unit_id' => $item->purchase_unit_id,
                'qty' => $item->qty,
                'received' => $item->received,
                'net_unit_cost' => $item->net_unit_cost,
                'discount' => $item->discount,
                'tax_rate' => $item->tax_rate,
                'tax' => $item->tax,
                'total' => $item->total,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
