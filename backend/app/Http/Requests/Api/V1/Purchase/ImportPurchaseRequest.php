<?php

namespace App\Http\Requests\Api\V1\Purchase;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportPurchaseRequest extends FormRequest
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
            'warehouse_id' => [
                'required', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'supplier_id' => [
                'nullable', 'integer',
                Rule::exists('suppliers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'status' => ['nullable', 'in:pending,received'],
            'order_tax' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'paying_method' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
        ];
    }
}
