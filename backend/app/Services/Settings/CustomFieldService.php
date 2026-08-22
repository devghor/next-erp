<?php

namespace App\Services\Settings;

use App\Models\Settings\Company;
use App\Models\Settings\CustomField;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class CustomFieldService implements CustomFieldServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return CustomField::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(custom_fields.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['belongs_to'] ?? null, fn (Builder $query, string $belongsTo) => $query->where('custom_fields.belongs_to', $belongsTo))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('custom_fields.name', 'like', "%{$name}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('custom_fields.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('custom_fields.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('custom_fields.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array{belongs_to: string, name: string, type: string, options?: array<int, string>|null, is_table?: bool, is_required?: bool}  $data
     */
    public function create(array $data): CustomField
    {
        return DB::transaction(fn () => CustomField::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
        ]));
    }

    public function findScoped(int $id): CustomField
    {
        return $this->baseScopedQuery()->where('custom_fields.id', $id)->firstOrFail();
    }

    /**
     * @param  array{belongs_to: string, name: string, type: string, options?: array<int, string>|null, is_table?: bool, is_required?: bool}  $data
     */
    public function update(int $id, array $data): CustomField
    {
        return DB::transaction(function () use ($id, $data) {
            $customField = $this->findScoped($id);
            $customField->fill($data);
            $customField->save();

            return $customField;
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
            $customFields = $this->baseScopedQuery()->whereIn('custom_fields.id', $ids)->get();
            $customFields->each->delete();

            return $customFields->count();
        });
    }
}
