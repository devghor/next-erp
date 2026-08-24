<?php

namespace App\Http\Resources\Api\V1\Sale;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    /**
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
            'currency_id' => $this->currency_id,
            'exchange_rate' => $this->exchange_rate,
            'item' => $this->item,
            'total_qty' => $this->total_qty,
            'total_discount' => $this->total_discount,
            'total_tax' => $this->total_tax,
            'total_price' => $this->total_price,
            'order_tax_rate' => $this->order_tax_rate,
            'order_tax' => $this->order_tax,
            'order_discount_type' => $this->order_discount_type,
            'order_discount_value' => $this->order_discount_value,
            'order_discount' => $this->order_discount,
            'coupon_id' => $this->coupon_id,
            'coupon_discount' => $this->coupon_discount,
            'shipping_cost' => $this->shipping_cost,
            'grand_total' => $this->grand_total,
            'paid_amount' => $this->paid_amount,
            'due_amount' => (float) $this->grand_total - (float) $this->paid_amount,
            'sale_status' => $this->sale_status,
            'payment_status' => $this->payment_status,
            'pay_term_no' => $this->pay_term_no,
            'pay_term_period' => $this->pay_term_period,
            'due_date' => $this->due_date,
            'document' => $this->document,
            'sale_note' => $this->sale_note,
            'staff_note' => $this->staff_note,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'variant_id' => $item->variant_id,
                'batch_id' => $item->batch_id,
                'sale_unit_id' => $item->sale_unit_id,
                'qty' => $item->qty,
                'return_qty' => $item->return_qty,
                'net_unit_price' => $item->net_unit_price,
                'discount' => $item->discount,
                'tax_rate' => $item->tax_rate,
                'tax' => $item->tax,
                'total' => $item->total,
                'is_packing' => $item->is_packing,
                'is_delivered' => $item->is_delivered,
            ])),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'payment_reference' => $payment->payment_reference,
                'amount' => $payment->amount,
                'paying_method' => $payment->paying_method,
                'account_id' => $payment->account_id,
                'created_at' => $payment->created_at,
            ])),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
