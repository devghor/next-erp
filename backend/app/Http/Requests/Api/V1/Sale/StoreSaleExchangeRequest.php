<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleExchangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sale_id' => [
                'nullable', 'integer',
                Rule::exists('sales', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
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
            'payment_type' => ['nullable', 'in:pay,receive'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'account_id' => ['nullable', 'integer'],
            'document' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,pdf,csv,docx,xlsx,txt'],
            'exchange_note' => ['nullable', 'string'],
            'staff_note' => ['nullable', 'string'],

            'lines' => ['required', 'array', 'min:1'],
            'lines.*.type' => ['required', 'in:new,returned'],
            'lines.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'lines.*.variant_id' => ['nullable', 'integer'],
            'lines.*.batch_id' => ['nullable', 'integer'],
            'lines.*.sale_unit_id' => ['nullable', 'integer'],
            'lines.*.product_sale_id' => ['nullable', 'integer'],
            'lines.*.qty' => ['required', 'numeric', 'min:0.0001'],
            'lines.*.net_unit_price' => ['required', 'numeric', 'min:0'],
            'lines.*.discount' => ['nullable', 'numeric', 'min:0'],
            'lines.*.tax_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
