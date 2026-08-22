<?php

namespace App\Services\Product;

use App\Enums\Media\MediaCollectionEnum;
use App\Imports\Product\CategoriesImport;
use App\Models\Product\Category;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class CategoryService implements CategoryServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Category::query()->with('parent')->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(categories.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('categories.name', 'like', "%{$name}%"))
            ->when($filters['parent_id'] ?? null, fn (Builder $query, string $parentId) => $query->where('categories.parent_id', $parentId))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('categories.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('categories.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('categories.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('categories.created_at')
            ->get();
    }

    /**
     * @param  array{name: string, parent_id?: int|null, image?: UploadedFile|null}  $data
     */
    public function create(array $data): Category
    {
        return DB::transaction(function () use ($data) {
            $category = Category::create([
                ...Arr::except($data, 'image'),
                'company_id' => $this->activeCompany()->id,
            ]);

            $this->syncImage($category, $data);

            return $category;
        });
    }

    public function findScoped(int $id): Category
    {
        return $this->baseScopedQuery()->where('categories.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, parent_id?: int|null, image?: UploadedFile|null}  $data
     */
    public function update(int $id, array $data): Category
    {
        return DB::transaction(function () use ($id, $data) {
            $category = $this->findScoped($id);
            $category->fill(Arr::except($data, 'image'));
            $category->save();

            $this->syncImage($category, $data);

            return $category;
        });
    }

    /**
     * @param  array{image?: UploadedFile|null}  $data
     */
    protected function syncImage(Category $category, array $data): void
    {
        if (empty($data['image'])) {
            return;
        }

        $category->addMedia($data['image'])
            ->toMediaCollection(MediaCollectionEnum::ProductCategoriesImage->value);
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
            $categories = $this->baseScopedQuery()->whereIn('categories.id', $ids)->get();
            $categories->each->delete();

            return $categories->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new CategoriesImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
