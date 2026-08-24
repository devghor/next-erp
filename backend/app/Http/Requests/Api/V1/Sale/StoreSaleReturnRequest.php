<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleReturnRequest extends FormRequest
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
                'required', 'integer',
                Rule::exists('sales', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_sale_id' => ['required', 'integer', Rule::exists('product_sales', 'id')],
            'lines.*.qty' => ['required', 'numeric', 'gt:0'],
            'refund' => ['nullable', 'boolean'],
            'refund_amount' => ['nullable', 'numeric', 'min:0'],
            'account_id' => [
                'nullable', 'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'paying_method' => ['nullable', 'string', 'max:191'],
            'change_sale_status' => ['nullable', 'boolean'],
            'return_note' => ['nullable', 'string'],
            'staff_note' => ['nullable', 'string'],
        ];
    }
}
