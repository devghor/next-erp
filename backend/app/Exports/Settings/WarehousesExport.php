<?php

namespace App\Exports\Settings;

use App\Models\Settings\Warehouse;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class WarehousesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $warehouses) {}

    public function collection(): Collection
    {
        return $this->warehouses;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Phone', 'Email', 'Address', 'Created At'];
    }

    /**
     * @param  Warehouse  $warehouse
     * @return array<int, mixed>
     */
    public function map($warehouse): array
    {
        return [
            $warehouse->id,
            $warehouse->name,
            $warehouse->phone,
            $warehouse->email,
            $warehouse->address,
            $warehouse->created_at?->toDateTimeString(),
        ];
    }
}
