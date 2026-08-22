<?php

namespace App\Http\Requests\Api\V1\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCurrencyRequest extends FormRequest
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
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('currencies', 'name')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'code' => [
                'required', 'string', 'max:10',
                Rule::unique('currencies', 'code')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'symbol' => ['nullable', 'string', 'max:10'],
            'exchange_rate' => ['required', 'numeric', 'min:0'],
        ];
    }
}
