<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PayInstallmentRequest extends FormRequest
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
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'paying_method' => ['nullable', 'string', 'max:191'],
            'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'cheque_no' => ['nullable', 'string', 'max:191'],
            'payment_note' => ['nullable', 'string'],
        ];
    }
}
