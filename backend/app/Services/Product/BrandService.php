<?php

namespace App\Services\Product;

use App\Enums\Media\MediaCollectionEnum;
use App\Imports\Product\BrandsImport;
use App\Models\Product\Brand;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class BrandService implements BrandServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Brand::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(brands.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('brands.name', 'like', "%{$name}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('brands.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('brands.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('brands.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('brands.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, image?: UploadedFile|null}  $data
     */
    public function create(array $data): Brand
    {
        return DB::transaction(function () use ($data) {
            $brand = Brand::create([
                ...Arr::except($data, 'image'),
                'company_id' => $this->activeCompany()->id,
            ]);

            $this->syncImage($brand, $data);

            return $brand;
        });
    }

    public function findScoped(int $id): Brand
    {
        return $this->baseScopedQuery()->where('brands.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, image?: UploadedFile|null}  $data
     */
    public function update(int $id, array $data): Brand
    {
        return DB::transaction(function () use ($id, $data) {
            $brand = $this->findScoped($id);
            $brand->fill(Arr::except($data, 'image'));
            $brand->save();

            $this->syncImage($brand, $data);

            return $brand;
        });
    }

    /**
     * @param  array{image?: UploadedFile|null}  $data
     */
    protected function syncImage(Brand $brand, array $data): void
    {
        if (empty($data['image'])) {
            return;
        }

        $brand->addMedia($data['image'])
            ->toMediaCollection(MediaCollectionEnum::ProductBrandsImage->value);
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
            $brands = $this->baseScopedQuery()->whereIn('brands.id', $ids)->get();
            $brands->each->delete();

            return $brands->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new BrandsImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
