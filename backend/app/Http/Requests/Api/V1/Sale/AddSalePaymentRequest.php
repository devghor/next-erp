<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddSalePaymentRequest extends FormRequest
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
            'paying_method' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'account_id' => ['nullable', 'integer', Rule::exists('accounts', 'id')],
            'gift_card_id' => ['nullable', 'integer'],
            'cheque_no' => ['nullable', 'string', 'max:255'],
            'payment_note' => ['nullable', 'string'],
            'gateway_reference' => ['nullable', 'string', 'max:255'],
            'gateway_status' => ['nullable', 'string', 'max:255'],
        ];
    }
}
