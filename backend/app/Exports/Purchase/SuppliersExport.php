<?php

namespace App\Exports\Purchase;

use App\Models\Purchase\Supplier;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SuppliersExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $suppliers) {}

    public function collection(): Collection
    {
        return $this->suppliers;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Phone', 'Email', 'Address', 'Created At'];
    }

    /**
     * @param  Supplier  $supplier
     * @return array<int, mixed>
     */
    public function map($supplier): array
    {
        return [
            $supplier->id,
            $supplier->name,
            $supplier->phone,
            $supplier->email,
            $supplier->address,
            $supplier->created_at?->toDateTimeString(),
        ];
    }
}
