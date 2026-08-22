<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBarcodeSettingRequest extends FormRequest
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
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('barcode_settings', 'name')
                    ->where(fn ($query) => $query->where('company_id', tenant()->id))
                    ->ignore($this->route('id')),
            ],
            'description' => ['nullable', 'string'],
            'width' => ['required', 'numeric', 'min:0.01'],
            'height' => ['required', 'numeric', 'min:0.01'],
            'paper_width' => ['nullable', 'numeric', 'min:0.01'],
            'paper_height' => ['nullable', 'numeric', 'min:0.01'],
            'top_margin' => ['nullable', 'numeric', 'min:0'],
            'left_margin' => ['nullable', 'numeric', 'min:0'],
            'row_distance' => ['nullable', 'numeric', 'min:0'],
            'col_distance' => ['nullable', 'numeric', 'min:0'],
            'stickers_in_one_row' => ['nullable', 'integer', 'min:1'],
            'stickers_in_one_sheet' => ['nullable', 'integer', 'min:1'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }
}
