<?php

namespace App\Exports\People;

use App\Models\People\SaleAgent;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SaleAgentsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $saleAgents) {}

    public function collection(): Collection
    {
        return $this->saleAgents;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Phone', 'Email', 'Address', 'Commission Rate', 'Created At'];
    }

    /**
     * @param  SaleAgent  $saleAgent
     * @return array<int, mixed>
     */
    public function map($saleAgent): array
    {
        return [
            $saleAgent->id,
            $saleAgent->name,
            $saleAgent->phone,
            $saleAgent->email,
            $saleAgent->address,
            $saleAgent->commission_rate,
            $saleAgent->created_at?->toDateTimeString(),
        ];
    }
}
