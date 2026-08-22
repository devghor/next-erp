<?php

namespace App\Imports\Product;

use App\Models\Product\Category;
use App\Models\Settings\Company;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CategoriesImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    protected int $imported = 0;

    public function __construct(protected Company $company) {}

    /**
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): ?Category
    {
        $parentId = null;
        if (! empty($row['parent'])) {
            $parent = Category::firstOrCreate([
                'company_id' => $this->company->id,
                'parent_id' => null,
                'name' => $row['parent'],
            ]);
            $parentId = $parent->id;
        }

        $category = Category::firstOrNew([
            'company_id' => $this->company->id,
            'parent_id' => $parentId,
            'name' => $row['name'],
        ]);
        $category->is_active = true;
        $category->save();

        $this->imported++;

        return null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'parent' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function importedCount(): int
    {
        return $this->imported;
    }

    /**
     * @return array<int, array{row: int, attribute: string, errors: array<int, string>}>
     */
    public function failuresArray(): array
    {
        return $this->failures()
            ->map(fn ($failure) => [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
            ])
            ->all();
    }
}
