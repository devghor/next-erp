<?php

namespace App\Services\Product;

use App\Models\Product\BarcodeSetting;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class BarcodeSettingService implements BarcodeSettingServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return BarcodeSetting::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->baseScopedQuery()
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('name', 'like', "%{$name}%"))
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): BarcodeSetting
    {
        return DB::transaction(function () use ($data) {
            $isDefault = (bool) ($data['is_default'] ?? false);

            if ($isDefault) {
                $this->baseScopedQuery()->update(['is_default' => false]);
            }

            return BarcodeSetting::create([
                ...$data,
                'company_id' => $this->activeCompany()->id,
                'is_default' => $isDefault,
            ]);
        });
    }

    public function findScoped(int $id): BarcodeSetting
    {
        return $this->baseScopedQuery()->where('id', $id)->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): BarcodeSetting
    {
        return DB::transaction(function () use ($id, $data) {
            $setting = $this->findScoped($id);

            if (! empty($data['is_default'])) {
                $this->baseScopedQuery()->where('id', '!=', $id)->update(['is_default' => false]);
            }

            $setting->fill($data);
            $setting->save();

            return $setting;
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
            $settings = $this->baseScopedQuery()->whereIn('id', $ids)->get();
            $settings->each->delete();

            return $settings->count();
        });
    }

    public function setDefault(int $id): BarcodeSetting
    {
        return DB::transaction(function () use ($id) {
            $this->baseScopedQuery()->update(['is_default' => false]);

            $setting = $this->findScoped($id);
            $setting->update(['is_default' => true]);

            return $setting;
        });
    }
}
