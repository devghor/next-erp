<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCouponRequest extends FormRequest
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
                'required', 'string', 'max:50',
                Rule::unique('coupons', 'code')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'name' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::in(['fixed', 'percentage'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'minimum_amount' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'expired_date' => ['required', 'date'],
        ];
    }
}
