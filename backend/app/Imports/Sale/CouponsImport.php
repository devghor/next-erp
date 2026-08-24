<?php

namespace App\Imports\Sale;

use App\Models\Sale\Coupon;
use App\Models\Settings\Company;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CouponsImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    protected int $imported = 0;

    public function __construct(protected Company $company) {}

    /**
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): ?Coupon
    {
        $coupon = Coupon::firstOrNew(['code' => $row['code'], 'company_id' => $this->company->id]);
        $coupon->name = $row['name'] ?? null;
        $coupon->type = $row['type'] ?? 'fixed';
        $coupon->amount = $row['amount'] ?? 0;
        $coupon->minimum_amount = $coupon->type === 'percentage' ? 0 : ($row['minimum_amount'] ?? 0);
        $coupon->quantity = $row['quantity'] ?? 0;
        $coupon->expired_date = $row['expired_date'] ?? null;
        $coupon->is_active = true;
        $coupon->save();

        $this->imported++;

        return null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'type' => ['required', 'in:fixed,percentage'],
            'amount' => ['required', 'numeric', 'min:0'],
            'minimum_amount' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'integer', 'min:0'],
            'expired_date' => ['required', 'date'],
        ];
    }

    public function importedCount(): int
    {
        return $this->imported;
    }

    /**
     * @return array<int, array{row: int, attribute: string, errors: array<int, string>}>
     */
    public function failuresArray(): array
    {
        return $this->failures()
            ->map(fn ($failure) => [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
            ])
            ->all();
    }
}
