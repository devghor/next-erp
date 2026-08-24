<?php

namespace App\Http\Requests\Api\V1\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
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
            'customer_id' => [
                'required', 'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'warehouse_id' => [
                'required', 'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'biller_id' => [
                'nullable', 'integer',
                Rule::exists('billers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'currency_id' => [
                'nullable', 'integer',
                Rule::exists('currencies', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'exchange_rate' => ['nullable', 'numeric', 'min:0'],
            'sale_status' => ['nullable', 'in:draft,completed'],
            'order_tax_rate' => ['nullable', 'numeric', 'min:0'],
            'order_discount_type' => ['nullable', 'in:fixed,percentage'],
            'order_discount_value' => ['nullable', 'numeric', 'min:0'],
            'coupon_id' => ['nullable', 'integer'],
            'coupon_discount' => ['nullable', 'numeric', 'min:0'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'pay_term_no' => ['nullable', 'integer', 'min:0'],
            'pay_term_period' => ['nullable', 'in:days,months'],
            'due_date' => ['nullable', 'date'],
            'sale_note' => ['nullable', 'string'],
            'staff_note' => ['nullable', 'string'],

            'is_pos' => ['nullable', 'boolean'],
            'cash_register_id' => [
                'nullable', 'integer',
                Rule::exists('cash_registers', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'client_reference' => [
                'nullable', 'string', 'max:255',
                Rule::unique('sales', 'client_reference')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required', 'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('company_id', tenant()->id)),
            ],
            'items.*.variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')],
            'items.*.batch_id' => ['nullable', 'integer', Rule::exists('product_batches', 'id')],
            'items.*.sale_unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')],
            'items.*.qty' => ['required', 'numeric', 'min:0.0001'],
            'items.*.net_unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0'],

            'payments' => ['nullable', 'array'],
            'payments.*.paying_method' => ['required_with:payments', 'string', 'max:255'],
            'payments.*.amount' => ['required_with:payments', 'numeric', 'min:0'],
            'payments.*.account_id' => ['nullable', 'integer', Rule::exists('accounts', 'id')],
            'payments.*.gift_card_id' => ['nullable', 'integer'],
            'payments.*.cheque_no' => ['nullable', 'string', 'max:255'],
            'payments.*.payment_note' => ['nullable', 'string'],
            'payments.*.gateway_reference' => ['nullable', 'string', 'max:255'],
            'payments.*.gateway_status' => ['nullable', 'string', 'max:255'],

            'installment' => ['nullable', 'array'],
            'installment.name' => ['required_with:installment', 'string', 'max:255'],
            'installment.price' => ['required_with:installment', 'numeric', 'min:0'],
            'installment.additional_amount' => ['nullable', 'numeric', 'min:0'],
            'installment.down_payment' => ['nullable', 'numeric', 'min:0'],
            'installment.months' => ['required_with:installment', 'integer', 'min:1'],
        ];
    }
}
