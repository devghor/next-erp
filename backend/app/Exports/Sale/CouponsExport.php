<?php

namespace App\Exports\Sale;

use App\Models\Sale\Coupon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CouponsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $coupons) {}

    public function collection(): Collection
    {
        return $this->coupons;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Code', 'Name', 'Type', 'Amount', 'Minimum Amount', 'Quantity', 'Used', 'Expired Date', 'Active', 'Created At'];
    }

    /**
     * @param  Coupon  $coupon
     * @return array<int, mixed>
     */
    public function map($coupon): array
    {
        return [
            $coupon->id,
            $coupon->code,
            $coupon->name,
            $coupon->type,
            $coupon->amount,
            $coupon->minimum_amount,
            $coupon->quantity,
            $coupon->used,
            $coupon->expired_date?->toDateString(),
            $coupon->is_active ? 'Yes' : 'No',
            $coupon->created_at?->toDateTimeString(),
        ];
    }
}
