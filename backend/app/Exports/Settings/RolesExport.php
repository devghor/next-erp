<?php

namespace App\Exports\Settings;

use App\Models\Settings\Role;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RolesExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(protected Collection $roles) {}

    public function collection(): Collection
    {
        return $this->roles;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Name', 'Permissions', 'Created At'];
    }

    /**
     * @param  Role  $role
     * @return array<int, mixed>
     */
    public function map($role): array
    {
        return [
            $role->id,
            $role->name,
            $role->permissions->pluck('name')->implode(', '),
            $role->created_at?->toDateTimeString(),
        ];
    }
}
