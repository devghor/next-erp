<?php

namespace App\Exports\Settings;

use App\Models\Settings\Tax;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TaxesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $taxes) {}

    public function collection(): Collection
    {
        return $this->taxes;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Rate', 'Created At'];
    }

    /**
     * @param  Tax  $tax
     * @return array<int, mixed>
     */
    public function map($tax): array
    {
        return [
            $tax->id,
            $tax->name,
            $tax->rate,
            $tax->created_at?->toDateTimeString(),
        ];
    }
}
