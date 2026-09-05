<?php

namespace App\Http\Requests\Api\V1\Quotation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuotationRequest extends FormRequest
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
            'customer_id' => [
                'required', 'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'warehouse_id' => [
                'required', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'biller_id' => [
                'nullable', 'integer',
                Rule::exists('billers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'supplier_id' => [
                'nullable', 'integer',
                Rule::exists('suppliers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'order_tax_rate' => ['nullable', 'numeric', 'min:0'],
            'order_tax' => ['nullable', 'numeric', 'min:0'],
            'order_discount' => ['nullable', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'quotation_status' => ['nullable', 'in:pending,sent'],
            'document' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,pdf,csv,docx,xlsx,txt', 'max:10240'],
            'note' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required', 'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'items.*.variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')],
            'items.*.batch_id' => ['nullable', 'integer', Rule::exists('product_batches', 'id')],
            'items.*.quotation_unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')],
            'items.*.qty' => ['required', 'numeric', 'min:0.0001'],
            'items.*.net_unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
