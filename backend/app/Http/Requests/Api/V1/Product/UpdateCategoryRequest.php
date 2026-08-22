<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCategoryRequest extends FormRequest
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
                Rule::unique('categories', 'name')
                    ->where(fn ($query) => $query->where('company_id', tenant()->id)->where('parent_id', $this->input('parent_id')))
                    ->ignore($this->route('id')),
            ],
            'parent_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ((int) $this->input('parent_id') === (int) $this->route('id')) {
                $validator->errors()->add('parent_id', 'A category cannot be its own parent.');
            }
        });
    }
}
