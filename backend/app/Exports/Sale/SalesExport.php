<?php

namespace App\Exports\Sale;

use App\Models\Sale\Sale;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SalesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $sales) {}

    public function collection(): Collection
    {
        return $this->sales;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Reference No', 'Customer', 'Warehouse', 'Sale Status', 'Payment Status', 'Grand Total', 'Paid Amount', 'Due Amount', 'Created At'];
    }

    /**
     * @param  Sale  $sale
     * @return array<int, mixed>
     */
    public function map($sale): array
    {
        return [
            $sale->id,
            $sale->reference_no,
            $sale->customer?->name,
            $sale->warehouse?->name,
            $sale->sale_status,
            $sale->payment_status,
            $sale->grand_total,
            $sale->paid_amount,
            (float) $sale->grand_total - (float) $sale->paid_amount,
            $sale->created_at?->toDateTimeString(),
        ];
    }
}
