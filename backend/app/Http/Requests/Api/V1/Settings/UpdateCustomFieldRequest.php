<?php

namespace App\Http\Requests\Api\V1\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomFieldRequest extends FormRequest
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
            'belongs_to' => ['required', 'string', 'max:255'],
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('custom_fields', 'name')
                    ->where(fn ($query) => $query->where('company_id', tenant()->id)->where('belongs_to', $this->input('belongs_to')))
                    ->ignore($this->route('id')),
            ],
            'type' => ['required', 'string', Rule::in(['text', 'number', 'select', 'checkbox', 'multi_select', 'date'])],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:255'],
            'is_table' => ['nullable', 'boolean'],
            'is_required' => ['nullable', 'boolean'],
        ];
    }
}
