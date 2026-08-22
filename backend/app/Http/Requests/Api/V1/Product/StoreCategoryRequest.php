<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
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
                    ->where(fn ($query) => $query->where('company_id', tenant()->id)->where('parent_id', $this->input('parent_id'))),
            ],
            'parent_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
