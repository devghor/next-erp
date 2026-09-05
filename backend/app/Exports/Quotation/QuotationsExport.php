<?php

namespace App\Exports\Quotation;

use App\Models\Quotation\Quotation;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuotationsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $quotations) {}

    public function collection(): Collection
    {
        return $this->quotations;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Reference No', 'Customer', 'Warehouse', 'Status', 'Grand Total', 'Created At'];
    }

    /**
     * @param  Quotation  $quotation
     * @return array<int, mixed>
     */
    public function map($quotation): array
    {
        return [
            $quotation->id,
            $quotation->reference_no,
            $quotation->customer?->name ?? 'N/A',
            $quotation->warehouse?->name,
            $quotation->quotation_status,
            $quotation->grand_total,
            $quotation->created_at?->toDateTimeString(),
        ];
    }
}
