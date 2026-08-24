<?php

namespace App\Http\Resources\Api\V1\Product;

use App\Enums\Media\MediaCollectionEnum;
use App\Services\Product\ProductServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\URL;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ProductServiceInterface $productService */
        $productService = App::make(ProductServiceInterface::class);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'type' => $this->type,

            'category_id' => $this->category_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category?->name),
            'brand_id' => $this->brand_id,
            'brand_name' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'unit_id' => $this->unit_id,
            'unit_name' => $this->whenLoaded('unit', fn () => $this->unit?->name),
            'purchase_unit_id' => $this->purchase_unit_id,
            'sale_unit_id' => $this->sale_unit_id,
            'tax_id' => $this->tax_id,
            'tax_name' => $this->whenLoaded('tax', fn () => $this->tax?->name),

            'cost' => $this->cost,
            'price' => $this->price,
            'wholesale_price' => $this->wholesale_price,
            'min_wholesale_qty' => $this->min_wholesale_qty,
            'tax_method' => $this->tax_method,
            'alert_quantity' => $this->alert_quantity,

            'has_warranty' => $this->has_warranty,
            'warranty_value' => $this->warranty_value,
            'warranty_type' => $this->warranty_type,
            'has_guarantee' => $this->has_guarantee,
            'guarantee_value' => $this->guarantee_value,
            'guarantee_type' => $this->guarantee_type,

            'starting_date' => $this->starting_date,
            'last_date' => $this->last_date,

            'is_variant' => $this->is_variant,
            'is_imei' => $this->is_imei,
            'is_batch' => $this->is_batch,
            'is_recipe' => $this->is_recipe,

            'wastage_percent' => $this->wastage_percent,
            'profit_margin' => $this->profit_margin,
            'product_details' => $this->product_details,
            'is_active' => $this->is_active,

            'images' => $this->imageUrls(),

            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($v) => [
                'id' => $v->id,
                'variant_id' => $v->variant_id,
                'name' => $v->variant?->name,
                'item_code' => $v->item_code,
                'additional_cost' => $v->additional_cost,
                'additional_price' => $v->additional_price,
                'position' => $v->position,
            ])),

            'batches' => $this->whenLoaded('batches', fn () => $this->batches->map(fn ($b) => [
                'id' => $b->id,
                'batch_no' => $b->batch_no,
                'expired_date' => $b->expired_date,
            ])),

            'combo_items' => $this->whenLoaded('comboItems', fn () => $this->comboItems->map(fn ($c) => [
                'id' => $c->id,
                'component_product_id' => $c->component_product_id,
                'component_product_name' => $c->componentProduct?->name,
                'component_variant_id' => $c->component_variant_id,
                'unit_id' => $c->unit_id,
                'qty' => $c->qty,
                'unit_price' => $c->unit_price,
                'wastage_percent' => $c->wastage_percent,
            ])),

            'stock' => $productService->stockFor($this->resource),
            'warehouse_stock' => $this->when(
                array_key_exists('warehouse_stock_qty', $this->resource->getAttributes()),
                fn () => (float) $this->warehouse_stock_qty
            ),
            'average_cost' => $productService->averageCost($this->id),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function imageUrls(): array
    {
        return $this->getMedia(MediaCollectionEnum::ProductProductsImage->value)
            ->map(fn ($media) => URL::temporarySignedRoute('v1.media.show', now()->addMinutes(30), ['media' => $media->id]))
            ->values()
            ->all();
    }
}
