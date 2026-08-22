<?php

namespace App\Imports\Product;

use App\Models\Product\Category;
use App\Models\Product\Product;
use App\Models\Settings\Company;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductsImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    protected int $imported = 0;

    public function __construct(protected Company $company) {}

    /**
     * Flat-row import for simple standard products only — variants, batches,
     * combos and IMEI products need their structured builders in the UI.
     *
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): ?Product
    {
        $category = Category::firstOrCreate([
            'company_id' => $this->company->id,
            'name' => $row['category'],
        ]);

        $product = Product::updateOrCreate(
            ['company_id' => $this->company->id, 'code' => $row['code']],
            [
                'category_id' => $category->id,
                'name' => $row['name'],
                'type' => 'standard',
                'cost' => $row['cost'] ?? 0,
                'price' => $row['price'] ?? 0,
                'alert_quantity' => $row['alert_quantity'] ?? 0,
                'is_active' => true,
            ]
        );

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
            'code' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'alert_quantity' => ['nullable', 'numeric', 'min:0'],
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
