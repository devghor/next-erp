<?php

namespace App\Services\People;

use App\Imports\People\CustomersImport;
use App\Models\People\Customer;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class CustomerService implements CustomerServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Customer::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(customers.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('customers.name', 'like', "%{$name}%"))
            ->when($filters['company_name'] ?? null, fn (Builder $query, string $companyName) => $query->where('customers.company_name', 'like', "%{$companyName}%"))
            ->when($filters['phone'] ?? null, fn (Builder $query, string $phone) => $query->where('customers.phone', 'like', "%{$phone}%"))
            ->when($filters['email'] ?? null, fn (Builder $query, string $email) => $query->where('customers.email', 'like', "%{$email}%"))
            ->when($filters['address'] ?? null, fn (Builder $query, string $address) => $query->where('customers.address', 'like', "%{$address}%"))
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $query->where('customers.city', 'like', "%{$city}%"))
            ->when($filters['state'] ?? null, fn (Builder $query, string $state) => $query->where('customers.state', 'like', "%{$state}%"))
            ->when($filters['postal_code'] ?? null, fn (Builder $query, string $postalCode) => $query->where('customers.postal_code', 'like', "%{$postalCode}%"))
            ->when($filters['country'] ?? null, fn (Builder $query, string $country) => $query->where('customers.country', 'like', "%{$country}%"))
            ->when($filters['tax_number'] ?? null, fn (Builder $query, string $taxNumber) => $query->where('customers.tax_number', 'like', "%{$taxNumber}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('customers.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('customers.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('customers.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('customers.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, tax_number?: string|null, credit_limit?: float|null}  $data
     */
    public function create(array $data): Customer
    {
        return DB::transaction(fn () => Customer::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): Customer
    {
        return $this->baseScopedQuery()->where('customers.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, tax_number?: string|null, credit_limit?: float|null}  $data
     */
    public function update(int $id, array $data): Customer
    {
        return DB::transaction(function () use ($id, $data) {
            $customer = $this->findScoped($id);
            $customer->fill($data);
            $customer->save();

            return $customer;
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
            $customers = $this->baseScopedQuery()->whereIn('customers.id', $ids)->get();
            $customers->each->delete();

            return $customers->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new CustomersImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
