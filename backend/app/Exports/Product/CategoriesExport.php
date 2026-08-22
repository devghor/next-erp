<?php

namespace App\Exports\Product;

use App\Models\Product\Category;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CategoriesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $categories) {}

    public function collection(): Collection
    {
        return $this->categories;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Parent', 'Created At'];
    }

    /**
     * @param  Category  $category
     * @return array<int, mixed>
     */
    public function map($category): array
    {
        return [
            $category->id,
            $category->name,
            $category->parent?->name ?? 'N/A',
            $category->created_at?->toDateTimeString(),
        ];
    }
}
