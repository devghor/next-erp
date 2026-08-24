<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleExchangeResource extends JsonResource
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
            'user_id' => $this->user_id,
            'item' => $this->item,
            'total_qty' => $this->total_qty,
            'total_discount' => $this->total_discount,
            'total_tax' => $this->total_tax,
            'amount' => $this->amount,
            'payment_type' => $this->payment_type,
            'order_tax_rate' => $this->order_tax_rate,
            'order_tax' => $this->order_tax,
            'grand_total' => $this->grand_total,
            'document' => $this->document,
            'exchange_note' => $this->exchange_note,
            'staff_note' => $this->staff_note,
            'new_products' => $this->whenLoaded('newProducts', fn () => $this->newProducts->map(fn ($line) => $this->mapLine($line))),
            'returned_products' => $this->whenLoaded('returnedProducts', fn () => $this->returnedProducts->map(fn ($line) => $this->mapLine($line))),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapLine($line): array
    {
        return [
            'id' => $line->id,
            'product_id' => $line->product_id,
            'product_name' => $line->product?->name,
            'variant_id' => $line->variant_id,
            'batch_id' => $line->batch_id,
            'sale_unit_id' => $line->sale_unit_id,
            'qty' => $line->qty,
            'net_unit_price' => $line->net_unit_price,
            'discount' => $line->discount,
            'tax_rate' => $line->tax_rate,
            'tax' => $line->tax,
            'total' => $line->total,
            'type' => $line->type,
        ];
    }
}
