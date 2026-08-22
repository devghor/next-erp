<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
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
            'code' => [
                'required', 'string', 'max:255',
                Rule::unique('units', 'code')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('units', 'name')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'base_unit_id' => [
                'nullable', 'integer',
                Rule::exists('units', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'operator' => ['nullable', 'in:*,/'],
            'operation_value' => ['nullable', 'numeric', 'min:0.0001'],
        ];
    }
}
