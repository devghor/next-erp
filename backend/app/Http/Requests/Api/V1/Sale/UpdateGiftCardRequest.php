<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateGiftCardRequest extends FormRequest
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
            'card_no' => [
                'required', 'string', 'max:191',
                Rule::unique('gift_cards', 'card_no')
                    ->where(fn ($query) => $query->where('company_id', tenant()->id))
                    ->ignore($this->route('id')),
            ],
            'customer_id' => [
                'nullable', 'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'expired_date' => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->filled('customer_id') && $this->filled('user_id')) {
                $validator->errors()->add('user_id', 'A gift card cannot belong to both a customer and a user.');
            }
        });
    }
}
