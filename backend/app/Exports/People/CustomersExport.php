<?php

namespace App\Exports\People;

use App\Models\People\Customer;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomersExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $customers) {}

    public function collection(): Collection
    {
        return $this->customers;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Company Name', 'Phone', 'Email', 'Address', 'City', 'State', 'Postal Code', 'Country', 'Tax Number', 'Credit Limit', 'Created At'];
    }

    /**
     * @param  Customer  $customer
     * @return array<int, mixed>
     */
    public function map($customer): array
    {
        return [
            $customer->id,
            $customer->name,
            $customer->company_name,
            $customer->phone,
            $customer->email,
            $customer->address,
            $customer->city,
            $customer->state,
            $customer->postal_code,
            $customer->country,
            $customer->tax_number,
            $customer->credit_limit,
            $customer->created_at?->toDateTimeString(),
        ];
    }
}
