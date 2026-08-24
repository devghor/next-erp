<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackingSlipRequest extends FormRequest
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
            'sale_id' => [
                'required', 'integer',
                Rule::exists('sales', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_sale_id' => ['required', 'integer', 'exists:product_sales,id'],
            'lines.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'lines.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
        ];
    }
}
