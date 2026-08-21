<?php

namespace App\Services\Settings;

use App\Imports\Settings\RolesImport;
use App\Models\Settings\Company;
use App\Models\Settings\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class RoleService
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    /**
     * Spatie's Role model has no built-in global scope by company (unlike
     * User, which is scoped through the company_user pivot) — every direct
     * Role query here must filter by company_id explicitly.
     */
    protected function baseScopedQuery(): Builder
    {
        return Role::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(roles.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('roles.name', 'like', "%{$name}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('roles.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('roles.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->with('permissions')
            ->orderByDesc('roles.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->with('permissions')
            ->orderByDesc('roles.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, permissions: array<int, string>}  $data
     */
    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create(['name' => $data['name']]);
            $role->syncPermissions($data['permissions']);

            return $role->load('permissions');
        });
    }

    public function findScoped(int $id): Role
    {
        return $this->baseScopedQuery()->with('permissions')->where('roles.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, permissions?: array<int, string>}  $data
     */
    public function update(int $id, array $data): Role
    {
        return DB::transaction(function () use ($id, $data) {
            $role = $this->findScoped($id);
            $role->fill(['name' => $data['name']]);
            $role->save();

            if (array_key_exists('permissions', $data)) {
                $role->syncPermissions($data['permissions']);
            }

            return $role->load('permissions');
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
            $roles = $this->baseScopedQuery()->whereIn('roles.id', $ids)->get();
            $roles->each->delete();

            return $roles->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new RolesImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
