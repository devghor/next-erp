<?php

namespace App\Exports\People;

use App\Models\People\Biller;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BillersExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $billers) {}

    public function collection(): Collection
    {
        return $this->billers;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Company Name', 'Phone', 'Email', 'Address', 'City', 'State', 'Postal Code', 'Country', 'VAT Number', 'Created At'];
    }

    /**
     * @param  Biller  $biller
     * @return array<int, mixed>
     */
    public function map($biller): array
    {
        return [
            $biller->id,
            $biller->name,
            $biller->company_name,
            $biller->phone,
            $biller->email,
            $biller->address,
            $biller->city,
            $biller->state,
            $biller->postal_code,
            $biller->country,
            $biller->vat_number,
            $biller->created_at?->toDateTimeString(),
        ];
    }
}
