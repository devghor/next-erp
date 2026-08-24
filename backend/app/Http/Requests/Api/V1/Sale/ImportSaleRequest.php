<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportSaleRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:csv,txt'],
            'customer_id' => [
                'required', 'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'warehouse_id' => [
                'required', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'biller_id' => ['nullable', 'integer', Rule::exists('billers', 'id')],
            'currency_id' => ['nullable', 'integer', Rule::exists('currencies', 'id')],
            'sale_status' => ['nullable', 'in:draft,completed'],
        ];
    }
}
