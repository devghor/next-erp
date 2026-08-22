<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PrintBarcodesRequest extends FormRequest
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
            'barcode_setting_id' => [
                'required', 'integer',
                Rule::exists('barcode_settings', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'products' => ['required', 'array', 'min:1'],
            'products.*.product_id' => [
                'required', 'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'products.*.qty' => ['required', 'integer', 'min:1', 'max:1000'],

            'print' => ['nullable', 'array'],
            'print.name' => ['nullable', 'boolean'],
            'print.name_size' => ['nullable', 'integer', 'min:6', 'max:72'],
            'print.price' => ['nullable', 'boolean'],
            'print.price_size' => ['nullable', 'integer', 'min:6', 'max:72'],
            'print.business_name' => ['nullable', 'boolean'],
            'print.business_name_size' => ['nullable', 'integer', 'min:6', 'max:72'],
            'print.brand_name' => ['nullable', 'boolean'],
            'print.brand_name_size' => ['nullable', 'integer', 'min:6', 'max:72'],
        ];
    }
}
