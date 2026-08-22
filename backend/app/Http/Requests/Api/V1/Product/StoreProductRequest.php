<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required', 'string', 'max:255',
                Rule::unique('products', 'code')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'type' => ['required', 'in:standard,combo,digital,service'],

            'category_id' => [
                'required', 'integer',
                Rule::exists('categories', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'brand_id' => ['nullable', 'integer', Rule::exists('brands', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id))],
            'unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id))],
            'purchase_unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id))],
            'sale_unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id))],
            'tax_id' => ['nullable', 'integer', Rule::exists('taxes', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id))],

            'cost' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'wholesale_price' => ['nullable', 'numeric', 'min:0'],
            'min_wholesale_qty' => ['nullable', 'numeric', 'min:0'],
            'tax_method' => ['nullable', 'integer', 'in:1,2'],
            'alert_quantity' => ['nullable', 'numeric', 'min:0'],

            'has_warranty' => ['nullable', 'boolean'],
            'warranty_value' => ['nullable', 'required_if:has_warranty,1', 'integer', 'min:1'],
            'warranty_type' => ['nullable', 'required_if:has_warranty,1', 'in:days,months,years'],
            'has_guarantee' => ['nullable', 'boolean'],
            'guarantee_value' => ['nullable', 'required_if:has_guarantee,1', 'integer', 'min:1'],
            'guarantee_type' => ['nullable', 'required_if:has_guarantee,1', 'in:days,months,years'],

            'starting_date' => ['nullable', 'date'],
            'last_date' => ['nullable', 'date', 'after_or_equal:starting_date'],

            'is_variant' => ['nullable', 'boolean'],
            'is_imei' => ['nullable', 'boolean'],
            'is_batch' => ['nullable', 'boolean'],
            'is_recipe' => ['nullable', 'boolean'],

            'wastage_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'profit_margin' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'product_details' => ['nullable', 'string'],

            'variants' => ['nullable', 'required_if:is_variant,1', 'array'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:255'],
            'variants.*.item_code' => ['required_with:variants', 'string', 'max:255', 'distinct'],
            'variants.*.additional_cost' => ['nullable', 'numeric'],
            'variants.*.additional_price' => ['nullable', 'numeric'],

            'batches' => ['nullable', 'required_if:is_batch,1', 'array'],
            'batches.*.batch_no' => ['required_with:batches', 'string', 'max:255', 'distinct'],
            'batches.*.expired_date' => ['nullable', 'date'],

            'combo_items' => ['nullable', 'required_if:type,combo', 'array'],
            'combo_items.*.component_product_id' => [
                'required_with:combo_items', 'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'combo_items.*.component_variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')],
            'combo_items.*.unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')],
            'combo_items.*.qty' => ['required_with:combo_items', 'numeric', 'min:0.0001'],
            'combo_items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'combo_items.*.wastage_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'initial_stock' => ['nullable', 'array'],
            'initial_stock.*.warehouse_id' => [
                'required_with:initial_stock', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'initial_stock.*.qty' => ['required_with:initial_stock', 'numeric', 'min:0'],

            'custom_fields' => ['nullable', 'array'],

            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'max:2048'],
        ];
    }
}
