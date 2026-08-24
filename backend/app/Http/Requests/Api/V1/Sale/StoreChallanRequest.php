<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChallanRequest extends FormRequest
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
            'courier_id' => [
                'nullable', 'integer',
                Rule::exists('couriers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'packing_slip_ids' => ['required', 'array', 'min:1'],
            'packing_slip_ids.*' => [
                'integer',
                Rule::exists('packing_slips', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
        ];
    }
}
