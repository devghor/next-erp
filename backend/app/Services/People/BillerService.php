<?php

namespace App\Services\People;

use App\Imports\People\BillersImport;
use App\Models\People\Biller;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class BillerService implements BillerServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Biller::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(billers.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('billers.name', 'like', "%{$name}%"))
            ->when($filters['company_name'] ?? null, fn (Builder $query, string $companyName) => $query->where('billers.company_name', 'like', "%{$companyName}%"))
            ->when($filters['phone'] ?? null, fn (Builder $query, string $phone) => $query->where('billers.phone', 'like', "%{$phone}%"))
            ->when($filters['email'] ?? null, fn (Builder $query, string $email) => $query->where('billers.email', 'like', "%{$email}%"))
            ->when($filters['address'] ?? null, fn (Builder $query, string $address) => $query->where('billers.address', 'like', "%{$address}%"))
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $query->where('billers.city', 'like', "%{$city}%"))
            ->when($filters['country'] ?? null, fn (Builder $query, string $country) => $query->where('billers.country', 'like', "%{$country}%"))
            ->when($filters['vat_number'] ?? null, fn (Builder $query, string $vatNumber) => $query->where('billers.vat_number', 'like', "%{$vatNumber}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('billers.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('billers.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('billers.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('billers.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, vat_number?: string|null}  $data
     */
    public function create(array $data): Biller
    {
        return DB::transaction(fn () => Biller::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): Biller
    {
        return $this->baseScopedQuery()->where('billers.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, vat_number?: string|null}  $data
     */
    public function update(int $id, array $data): Biller
    {
        return DB::transaction(function () use ($id, $data) {
            $biller = $this->findScoped($id);
            $biller->fill($data);
            $biller->save();

            return $biller;
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
            $billers = $this->baseScopedQuery()->whereIn('billers.id', $ids)->get();
            $billers->each->delete();

            return $billers->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new BillersImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
