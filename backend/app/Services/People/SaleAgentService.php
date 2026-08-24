<?php

namespace App\Services\People;

use App\Imports\People\SaleAgentsImport;
use App\Models\People\SaleAgent;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class SaleAgentService implements SaleAgentServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return SaleAgent::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(sale_agents.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('sale_agents.name', 'like', "%{$name}%"))
            ->when($filters['phone'] ?? null, fn (Builder $query, string $phone) => $query->where('sale_agents.phone', 'like', "%{$phone}%"))
            ->when($filters['email'] ?? null, fn (Builder $query, string $email) => $query->where('sale_agents.email', 'like', "%{$email}%"))
            ->when($filters['address'] ?? null, fn (Builder $query, string $address) => $query->where('sale_agents.address', 'like', "%{$address}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('sale_agents.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('sale_agents.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('sale_agents.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('sale_agents.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null, commission_rate?: float|null}  $data
     */
    public function create(array $data): SaleAgent
    {
        return DB::transaction(fn () => SaleAgent::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): SaleAgent
    {
        return $this->baseScopedQuery()->where('sale_agents.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null, commission_rate?: float|null}  $data
     */
    public function update(int $id, array $data): SaleAgent
    {
        return DB::transaction(function () use ($id, $data) {
            $saleAgent = $this->findScoped($id);
            $saleAgent->fill($data);
            $saleAgent->save();

            return $saleAgent;
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
            $saleAgents = $this->baseScopedQuery()->whereIn('sale_agents.id', $ids)->get();
            $saleAgents->each->delete();

            return $saleAgents->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new SaleAgentsImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
