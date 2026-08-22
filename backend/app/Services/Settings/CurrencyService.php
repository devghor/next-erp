<?php

namespace App\Services\Settings;

use App\Imports\Settings\CurrenciesImport;
use App\Models\Settings\Company;
use App\Models\Settings\Currency;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class CurrencyService implements CurrencyServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Currency::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(currencies.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('currencies.name', 'like', "%{$name}%"))
            ->when($filters['code'] ?? null, fn (Builder $query, string $code) => $query->where('currencies.code', 'like', "%{$code}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('currencies.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('currencies.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('currencies.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('currencies.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, code: string, symbol?: string|null, exchange_rate: float}  $data
     */
    public function create(array $data): Currency
    {
        return DB::transaction(fn () => Currency::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): Currency
    {
        return $this->baseScopedQuery()->where('currencies.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, code: string, symbol?: string|null, exchange_rate: float}  $data
     */
    public function update(int $id, array $data): Currency
    {
        return DB::transaction(function () use ($id, $data) {
            $currency = $this->findScoped($id);
            $currency->fill($data);
            $currency->save();

            return $currency;
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
            $currencies = $this->baseScopedQuery()->whereIn('currencies.id', $ids)->get();
            $currencies->each->delete();

            return $currencies->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new CurrenciesImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
