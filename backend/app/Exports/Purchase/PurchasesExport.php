<?php

namespace App\Exports\Purchase;

use App\Models\Purchase\Purchase;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PurchasesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $purchases) {}

    public function collection(): Collection
    {
        return $this->purchases;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Reference No', 'Supplier', 'Warehouse', 'Status', 'Payment Status', 'Grand Total', 'Paid Amount', 'Created At'];
    }

    /**
     * @param  Purchase  $purchase
     * @return array<int, mixed>
     */
    public function map($purchase): array
    {
        return [
            $purchase->id,
            $purchase->reference_no,
            $purchase->supplier?->name ?? 'N/A',
            $purchase->warehouse?->name,
            $purchase->status,
            $purchase->payment_status,
            $purchase->grand_total,
            $purchase->paid_amount,
            $purchase->created_at?->toDateTimeString(),
        ];
    }
}
