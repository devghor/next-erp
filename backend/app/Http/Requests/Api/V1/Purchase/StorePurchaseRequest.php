<?php

namespace App\Http\Requests\Api\V1\Purchase;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseRequest extends FormRequest
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
            'supplier_id' => [
                'nullable', 'integer',
                Rule::exists('suppliers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'warehouse_id' => [
                'required', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'order_tax' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'paying_method' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required', 'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'items.*.variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')],
            'items.*.batch_id' => ['nullable', 'integer', Rule::exists('product_batches', 'id')],
            'items.*.purchase_unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')],
            'items.*.qty' => ['required', 'numeric', 'min:0.0001'],
            'items.*.received' => ['nullable', 'numeric', 'min:0'],
            'items.*.net_unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
