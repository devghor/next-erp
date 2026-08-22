<?php

namespace App\Exports\Product;

use App\Models\Product\Brand;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BrandsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $brands) {}

    public function collection(): Collection
    {
        return $this->brands;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Created At'];
    }

    /**
     * @param  Brand  $brand
     * @return array<int, mixed>
     */
    public function map($brand): array
    {
        return [
            $brand->id,
            $brand->name,
            $brand->created_at?->toDateTimeString(),
        ];
    }
}
