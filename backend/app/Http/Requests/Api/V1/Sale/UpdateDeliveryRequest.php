<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDeliveryRequest extends FormRequest
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
            'address' => ['nullable', 'string'],
            'delivered_by' => ['nullable', 'string', 'max:191'],
            'recieved_by' => ['nullable', 'string', 'max:191'],
            'note' => ['nullable', 'string'],
            'status' => ['nullable', 'string', Rule::in(['packing', 'delivering', 'delivered'])],
        ];
    }
}
