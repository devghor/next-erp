<?php

namespace App\Services\Sale;

use App\Imports\Sale\CouriersImport;
use App\Models\Sale\Courier;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class CourierService implements CourierServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Courier::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(couriers.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('couriers.name', 'like', "%{$name}%"))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('couriers.type', $type))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('couriers.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('couriers.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('couriers.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('couriers.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, type: string}  $data
     */
    public function create(array $data): Courier
    {
        return DB::transaction(fn () => Courier::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): Courier
    {
        return $this->baseScopedQuery()->where('couriers.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, type: string}  $data
     */
    public function update(int $id, array $data): Courier
    {
        return DB::transaction(function () use ($id, $data) {
            $courier = $this->findScoped($id);
            $courier->fill($data);
            $courier->save();

            return $courier;
        });
    }

    /**
     * Soft-deactivate rather than hard delete, matching salespro's courier behavior.
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $courier = $this->findScoped($id);
            $courier->is_active = false;
            $courier->save();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $couriers = $this->baseScopedQuery()->whereIn('couriers.id', $ids)->get();
            $couriers->each(function (Courier $courier) {
                $courier->is_active = false;
                $courier->save();
            });

            return $couriers->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new CouriersImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
