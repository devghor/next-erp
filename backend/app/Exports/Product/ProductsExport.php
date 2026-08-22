<?php

namespace App\Exports\Product;

use App\Models\Product\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $products) {}

    public function collection(): Collection
    {
        return $this->products;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Code', 'Type', 'Category', 'Brand', 'Unit', 'Cost', 'Price', 'Tax', 'Alert Quantity', 'Created At'];
    }

    /**
     * @param  Product  $product
     * @return array<int, mixed>
     */
    public function map($product): array
    {
        return [
            $product->id,
            $product->name,
            $product->code,
            $product->type,
            $product->category?->name ?? 'N/A',
            $product->brand?->name ?? 'N/A',
            $product->unit?->name ?? 'N/A',
            $product->cost,
            $product->price,
            $product->tax?->name ?? 'N/A',
            $product->alert_quantity,
            $product->created_at?->toDateTimeString(),
        ];
    }
}
