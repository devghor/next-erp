<?php

namespace App\Services\Settings;

use App\Imports\Settings\WarehousesImport;
use App\Models\Settings\Company;
use App\Models\Settings\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class WarehouseService implements WarehouseServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Warehouse::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(warehouses.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('warehouses.name', 'like', "%{$name}%"))
            ->when($filters['phone'] ?? null, fn (Builder $query, string $phone) => $query->where('warehouses.phone', 'like', "%{$phone}%"))
            ->when($filters['email'] ?? null, fn (Builder $query, string $email) => $query->where('warehouses.email', 'like', "%{$email}%"))
            ->when($filters['address'] ?? null, fn (Builder $query, string $address) => $query->where('warehouses.address', 'like', "%{$address}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('warehouses.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('warehouses.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('warehouses.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('warehouses.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null}  $data
     */
    public function create(array $data): Warehouse
    {
        return DB::transaction(fn () => Warehouse::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): Warehouse
    {
        return $this->baseScopedQuery()->where('warehouses.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null}  $data
     */
    public function update(int $id, array $data): Warehouse
    {
        return DB::transaction(function () use ($id, $data) {
            $warehouse = $this->findScoped($id);
            $warehouse->fill($data);
            $warehouse->save();

            return $warehouse;
        });
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
            $warehouses = $this->baseScopedQuery()->whereIn('warehouses.id', $ids)->get();
            $warehouses->each->delete();

            return $warehouses->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new WarehousesImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
