<?php

namespace App\Imports\Product;

use App\Models\Product\Unit;
use App\Models\Settings\Company;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class UnitsImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    protected int $imported = 0;

    public function __construct(protected Company $company) {}

    /**
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): ?Unit
    {
        $baseUnitId = null;
        if (! empty($row['base_unit'])) {
            $baseUnit = Unit::where('company_id', $this->company->id)
                ->where('code', $row['base_unit'])
                ->first();
            $baseUnitId = $baseUnit?->id;
        }

        $operator = $row['operator'] ?? '*';
        $operationValue = $row['operation_value'] ?? 1;

        if (! $baseUnitId) {
            $operator = '*';
            $operationValue = 1;
        }

        $unit = Unit::firstOrNew([
            'company_id' => $this->company->id,
            'code' => $row['code'],
        ]);
        $unit->name = $row['name'];
        $unit->base_unit_id = $baseUnitId;
        $unit->operator = $operator;
        $unit->operation_value = $operationValue;
        $unit->is_active = true;
        $unit->save();

        $this->imported++;

        return null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'base_unit' => ['nullable', 'string', 'max:255'],
            'operator' => ['nullable', 'string'],
            'operation_value' => ['nullable', 'numeric'],
        ];
    }

    public function importedCount(): int
    {
        return $this->imported;
    }

    /**
     * @return array<int, array{row: int, attribute: string, errors: array<int, string>}>
     */
    public function failuresArray(): array
    {
        return $this->failures()
            ->map(fn ($failure) => [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
            ])
            ->all();
    }
}
