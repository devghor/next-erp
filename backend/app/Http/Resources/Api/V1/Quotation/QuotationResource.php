<?php

namespace App\Http\Resources\Api\V1\Quotation;

use App\Enums\Media\MediaCollectionEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class QuotationResource extends JsonResource
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
            'customer_id' => $this->customer_id,
            'customer_name' => $this->whenLoaded('customer', fn () => $this->customer?->name),
            'warehouse_id' => $this->warehouse_id,
            'warehouse_name' => $this->whenLoaded('warehouse', fn () => $this->warehouse?->name),
            'biller_id' => $this->biller_id,
            'biller_name' => $this->whenLoaded('biller', fn () => $this->biller?->name),
            'supplier_id' => $this->supplier_id,
            'supplier_name' => $this->whenLoaded('supplier', fn () => $this->supplier?->name),
            'item' => $this->item,
            'total_qty' => $this->total_qty,
            'total_discount' => $this->total_discount,
            'total_tax' => $this->total_tax,
            'total_price' => $this->total_price,
            'order_tax_rate' => $this->order_tax_rate,
            'order_tax' => $this->order_tax,
            'order_discount' => $this->order_discount,
            'shipping_cost' => $this->shipping_cost,
            'grand_total' => $this->grand_total,
            'quotation_status' => $this->quotation_status,
            'document_url' => $this->documentUrl(),
            'note' => $this->note,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'variant_id' => $item->variant_id,
                'batch_id' => $item->batch_id,
                'quotation_unit_id' => $item->quotation_unit_id,
                'qty' => $item->qty,
                'net_unit_price' => $item->net_unit_price,
                'discount' => $item->discount,
                'tax_rate' => $item->tax_rate,
                'tax' => $item->tax,
                'total' => $item->total,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    protected function documentUrl(): ?string
    {
        $media = $this->getFirstMedia(MediaCollectionEnum::QuotationQuotationsDocument->value);

        if (! $media) {
            return null;
        }

        return URL::temporarySignedRoute('v1.media.show', now()->addMinutes(30), ['media' => $media->id]);
    }
}
