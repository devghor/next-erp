<?php

namespace App\Exports\Product;

use App\Models\Product\Unit;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UnitsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $units) {}

    public function collection(): Collection
    {
        return $this->units;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Code', 'Name', 'Base Unit', 'Operator', 'Operation Value', 'Created At'];
    }

    /**
     * @param  Unit  $unit
     * @return array<int, mixed>
     */
    public function map($unit): array
    {
        return [
            $unit->id,
            $unit->code,
            $unit->name,
            $unit->baseUnit?->name ?? 'N/A',
            $unit->operator,
            $unit->operation_value,
            $unit->created_at?->toDateTimeString(),
        ];
    }
}
