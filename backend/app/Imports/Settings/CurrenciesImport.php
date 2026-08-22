<?php

namespace App\Imports\Settings;

use App\Models\Settings\Company;
use App\Models\Settings\Currency;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CurrenciesImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    protected int $imported = 0;

    public function __construct(protected Company $company) {}

    /**
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): ?Currency
    {
        $currency = Currency::firstOrNew(['code' => $row['code'], 'company_id' => $this->company->id]);
        $currency->name = $row['name'];
        $currency->symbol = $row['symbol'] ?? null;
        $currency->exchange_rate = $row['exchange_rate'] ?? 1;
        $currency->is_active = true;
        $currency->save();

        $this->imported++;

        return null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:10'],
            'symbol' => ['nullable', 'string', 'max:10'],
            'exchange_rate' => ['nullable', 'numeric', 'min:0'],
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
