<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class FinalizeChallanRequest extends FormRequest
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
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.challan_packing_slip_id' => ['required', 'integer'],
            'payments.*.status' => ['required', 'in:delivered,cancelled'],
            'payments.*.paid_amount' => ['nullable', 'numeric', 'min:0'],
            'payments.*.delivery_charge' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
