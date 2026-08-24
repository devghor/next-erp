<?php

namespace App\Exports\Sale;

use App\Models\Sale\Courier;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CouriersExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $couriers) {}

    public function collection(): Collection
    {
        return $this->couriers;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Type', 'Phone Number', 'Address', 'Active', 'Created At'];
    }

    /**
     * @param  Courier  $courier
     * @return array<int, mixed>
     */
    public function map($courier): array
    {
        return [
            $courier->id,
            $courier->name,
            $courier->type,
            $courier->phone_number,
            $courier->address,
            $courier->is_active ? 'Yes' : 'No',
            $courier->created_at?->toDateTimeString(),
        ];
    }
}
