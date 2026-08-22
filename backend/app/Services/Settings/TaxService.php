<?php

namespace App\Services\Settings;

use App\Imports\Settings\TaxesImport;
use App\Models\Settings\Company;
use App\Models\Settings\Tax;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class TaxService implements TaxServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Tax::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(taxes.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('taxes.name', 'like', "%{$name}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('taxes.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('taxes.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('taxes.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('taxes.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, rate: float}  $data
     */
    public function create(array $data): Tax
    {
        return DB::transaction(fn () => Tax::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): Tax
    {
        return $this->baseScopedQuery()->where('taxes.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, rate: float}  $data
     */
    public function update(int $id, array $data): Tax
    {
        return DB::transaction(function () use ($id, $data) {
            $tax = $this->findScoped($id);
            $tax->fill($data);
            $tax->save();

            return $tax;
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
            $taxes = $this->baseScopedQuery()->whereIn('taxes.id', $ids)->get();
            $taxes->each->delete();

            return $taxes->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new TaxesImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
