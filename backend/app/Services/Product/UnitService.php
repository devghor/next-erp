<?php

namespace App\Services\Product;

use App\Imports\Product\UnitsImport;
use App\Models\Product\Unit;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class UnitService implements UnitServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Unit::query()->with('baseUnit')->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(units.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['code'] ?? null, fn (Builder $query, string $code) => $query->where('units.code', 'like', "%{$code}%"))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('units.name', 'like', "%{$name}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('units.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('units.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('units.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('units.created_at')
            ->get();
    }

    /**
     * @param  array{code: string, name: string, base_unit_id?: int|null, operator?: string, operation_value?: float|string}  $data
     */
    public function create(array $data): Unit
    {
        return DB::transaction(function () use ($data) {
            return Unit::create([
                ...$this->applyBaseUnitRule($data),
                'company_id' => $this->activeCompany()->id,
            ]);
        });
    }

    public function findScoped(int $id): Unit
    {
        return $this->baseScopedQuery()->where('units.id', $id)->firstOrFail();
    }

    /**
     * @param  array{code: string, name: string, base_unit_id?: int|null, operator?: string, operation_value?: float|string}  $data
     */
    public function update(int $id, array $data): Unit
    {
        return DB::transaction(function () use ($id, $data) {
            $unit = $this->findScoped($id);
            $unit->fill($this->applyBaseUnitRule($data));
            $unit->save();

            return $unit;
        });
    }

    /**
     * A unit with no base unit is its own reference point, so force the
     * conversion factor back to identity (`* 1`) regardless of input.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function applyBaseUnitRule(array $data): array
    {
        if (empty($data['base_unit_id'])) {
            $data['operator'] = '*';
            $data['operation_value'] = 1;
        }

        return $data;
    }

    public function delete(int $id): void
    {
        DB::transaction(fn () => $this->findScoped($id)->delete());
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $units = $this->baseScopedQuery()->whereIn('units.id', $ids)->get();
            $units->each->delete();

            return $units->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new UnitsImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
