<?php

namespace App\Exports\Settings;

use App\Models\Settings\Currency;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CurrenciesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $currencies) {}

    public function collection(): Collection
    {
        return $this->currencies;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Code', 'Symbol', 'Exchange Rate', 'Created At'];
    }

    /**
     * @param  Currency  $currency
     * @return array<int, mixed>
     */
    public function map($currency): array
    {
        return [
            $currency->id,
            $currency->name,
            $currency->code,
            $currency->symbol,
            $currency->exchange_rate,
            $currency->created_at?->toDateTimeString(),
        ];
    }
}
