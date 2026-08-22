<?php

namespace App\Services\Product;

use App\Enums\Media\MediaCollectionEnum;
use App\Imports\Product\ProductsImport;
use App\Models\Product\Product;
use App\Models\Product\ProductBatch;
use App\Models\Product\ProductComboItem;
use App\Models\Product\ProductVariant;
use App\Models\Product\Variant;
use App\Models\Purchase\ProductPurchase;
use App\Models\Settings\Company;
use App\Models\Settings\CustomFieldValue;
use App\Services\Purchase\PurchaseServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ProductService implements ProductServiceInterface
{
    public function __construct(protected PurchaseServiceInterface $purchaseService) {}

    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Product::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->with(['category', 'brand', 'unit', 'tax'])
            ->when(! ($filters['include_inactive'] ?? false), fn (Builder $query) => $query->where('products.is_active', true))
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(products.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where(function (Builder $q) use ($name) {
                $q->where('products.name', 'like', "%{$name}%")->orWhere('products.code', 'like', "%{$name}%");
            }))
            ->when($filters['category_id'] ?? null, fn (Builder $query, string $id) => $query->where('products.category_id', $id))
            ->when($filters['brand_id'] ?? null, fn (Builder $query, string $id) => $query->where('products.brand_id', $id))
            ->when($filters['unit_id'] ?? null, fn (Builder $query, string $id) => $query->where('products.unit_id', $id))
            ->when($filters['tax_id'] ?? null, fn (Builder $query, string $id) => $query->where('products.tax_id', $id))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('products.type', $type))
            ->when($filters['stock_filter'] ?? null, function (Builder $query, string $filter) {
                $stockSubQuery = '(select coalesce(sum(qty), 0) from product_warehouses where product_warehouses.product_id = products.id)';

                if ($filter === 'with') {
                    $query->whereRaw("{$stockSubQuery} > 0");
                } elseif ($filter === 'without') {
                    $query->whereRaw("{$stockSubQuery} <= 0");
                }
            })
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('products.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('products.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('products.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('products.created_at')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                ...Arr::except($data, ['variants', 'batches', 'combo_items', 'initial_stock', 'custom_fields', 'images']),
                'company_id' => $this->activeCompany()->id,
            ]);

            $this->syncVariants($product, $data);
            $this->syncBatches($product, $data);
            $this->syncComboItems($product, $data);
            $this->syncInitialStock($product, $data);
            $this->syncCustomFields($product, $data);
            $this->syncImages($product, $data);

            return $product->fresh(['category', 'brand', 'unit', 'tax', 'variants.variant', 'batches', 'comboItems']);
        });
    }

    public function findScoped(int $id): Product
    {
        return $this->baseScopedQuery()
            ->with(['category', 'brand', 'unit', 'purchaseUnit', 'saleUnit', 'tax', 'variants.variant', 'batches', 'comboItems.componentProduct', 'stocks.warehouse', 'customFieldValues.customField'])
            ->where('products.id', $id)
            ->firstOrFail();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Product
    {
        return DB::transaction(function () use ($id, $data) {
            $product = $this->findScoped($id);
            $product->fill(Arr::except($data, ['variants', 'batches', 'combo_items', 'initial_stock', 'custom_fields', 'images']));
            $product->save();

            if (array_key_exists('variants', $data)) {
                $product->variants()->delete();
                $this->syncVariants($product, $data);
            }

            if (array_key_exists('batches', $data)) {
                $product->batches()->delete();
                $this->syncBatches($product, $data);
            }

            if (array_key_exists('combo_items', $data)) {
                $product->comboItems()->delete();
                $this->syncComboItems($product, $data);
            }

            $this->syncCustomFields($product, $data);
            $this->syncImages($product, $data);

            return $product->fresh(['category', 'brand', 'unit', 'tax', 'variants.variant', 'batches', 'comboItems']);
        });
    }

    /**
     * Products accumulate restrict-on-delete references (purchase history,
     * combo composition) as soon as they're used, so "delete" deactivates
     * rather than removing the row — mirrors legacy's `is_active` soft-delete
     * convention for this entity specifically.
     */
    public function delete(int $id): void
    {
        DB::transaction(fn () => $this->findScoped($id)->update(['is_active' => false]));
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $products = $this->baseScopedQuery()->whereIn('products.id', $ids)->get();
            $products->each->update(['is_active' => false]);

            return $products->count();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function syncVariants(Product $product, array $data): void
    {
        if (! ($data['is_variant'] ?? false) || empty($data['variants'])) {
            return;
        }

        foreach ($data['variants'] as $position => $row) {
            $variant = Variant::firstOrCreate([
                'company_id' => $this->activeCompany()->id,
                'name' => $row['name'],
            ]);

            ProductVariant::create([
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'item_code' => $row['item_code'],
                'additional_cost' => $row['additional_cost'] ?? 0,
                'additional_price' => $row['additional_price'] ?? 0,
                'position' => $position + 1,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function syncBatches(Product $product, array $data): void
    {
        if (! ($data['is_batch'] ?? false) || empty($data['batches'])) {
            return;
        }

        foreach ($data['batches'] as $row) {
            ProductBatch::create([
                'product_id' => $product->id,
                'batch_no' => $row['batch_no'],
                'expired_date' => $row['expired_date'] ?? null,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function syncComboItems(Product $product, array $data): void
    {
        if ($product->type !== 'combo' || empty($data['combo_items'])) {
            return;
        }

        foreach ($data['combo_items'] as $row) {
            ProductComboItem::create([
                'combo_product_id' => $product->id,
                'component_product_id' => $row['component_product_id'],
                'component_variant_id' => $row['component_variant_id'] ?? null,
                'unit_id' => $row['unit_id'] ?? null,
                'qty' => $row['qty'],
                'unit_price' => $row['unit_price'] ?? 0,
                'wastage_percent' => $row['wastage_percent'] ?? 0,
            ]);
        }
    }

    /**
     * Direct port of legacy `autoPurchase()` — only fires for simple
     * (non-variant, non-batch) products with initial stock lines.
     *
     * @param  array<string, mixed>  $data
     */
    protected function syncInitialStock(Product $product, array $data): void
    {
        if (($data['is_variant'] ?? false) || ($data['is_batch'] ?? false) || empty($data['initial_stock'])) {
            return;
        }

        $this->purchaseService->receiveInitialStock($product, $data['initial_stock']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function syncCustomFields(Product $product, array $data): void
    {
        if (empty($data['custom_fields'])) {
            return;
        }

        foreach ($data['custom_fields'] as $customFieldId => $value) {
            CustomFieldValue::updateOrCreate(
                ['custom_field_id' => $customFieldId, 'product_id' => $product->id],
                ['value' => is_array($value) ? implode(',', $value) : $value],
            );
        }
    }

    /**
     * @param  array{images?: array<int, UploadedFile>}  $data
     */
    protected function syncImages(Product $product, array $data): void
    {
        if (empty($data['images'])) {
            return;
        }

        foreach ($data['images'] as $image) {
            $product->addMedia($image)->toMediaCollection(MediaCollectionEnum::ProductProductsImage->value);
        }
    }

    public function stockFor(Product $product, ?int $warehouseId = null): float
    {
        if ($product->type === 'combo') {
            return $this->comboStock($product, $warehouseId);
        }

        return (float) $product->stocks()
            ->when($warehouseId, fn (Builder $q) => $q->where('warehouse_id', $warehouseId))
            ->sum('qty');
    }

    protected function comboStock(Product $comboProduct, ?int $warehouseId = null): float
    {
        $comboItems = $comboProduct->comboItems;

        if ($comboItems->isEmpty()) {
            return 0;
        }

        $possible = $comboItems->map(function (ProductComboItem $item) use ($warehouseId) {
            $componentStock = (float) $item->componentProduct->stocks()
                ->when($warehouseId, fn (Builder $q) => $q->where('warehouse_id', $warehouseId))
                ->sum('qty');

            return $item->qty > 0 ? floor($componentStock / $item->qty) : 0;
        });

        return (float) $possible->min();
    }

    public function averageCost(int $productId): float
    {
        $row = ProductPurchase::where('product_id', $productId)
            ->selectRaw('COALESCE(SUM(qty * net_unit_cost) / NULLIF(SUM(qty), 0), 0) as avg_cost')
            ->first();

        return (float) ($row->avg_cost ?? 0);
    }

    /**
     * @return array<string, mixed>
     */
    public function history(int $id): array
    {
        $product = $this->findScoped($id);

        $purchases = ProductPurchase::with(['purchase.supplier', 'purchase.warehouse'])
            ->where('product_id', $product->id)
            ->whereHas('purchase', fn (Builder $q) => $q->where('company_id', $this->activeCompany()->id))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ProductPurchase $item) => [
                'purchase_id' => $item->purchase_id,
                'reference_no' => $item->purchase?->reference_no,
                'date' => $item->created_at?->toDateString(),
                'warehouse' => $item->purchase?->warehouse?->name,
                'supplier' => $item->purchase?->supplier?->name ?? 'N/A',
                'qty' => (float) $item->qty,
                'net_unit_cost' => (float) $item->net_unit_cost,
                'total' => (float) $item->total,
            ]);

        $stockByWarehouse = $product->stocks()
            ->with('warehouse')
            ->get()
            ->groupBy('warehouse_id')
            ->map(fn ($rows) => [
                'warehouse' => $rows->first()->warehouse?->name,
                'qty' => (float) $rows->sum('qty'),
            ])
            ->values();

        return [
            'purchase_history' => $purchases,
            'stock_by_warehouse' => $stockByWarehouse,
            'total_stock' => $this->stockFor($product),
            'average_cost' => $this->averageCost($product->id),
        ];
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new ProductsImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
