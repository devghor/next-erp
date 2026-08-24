<?php

namespace App\Services\Purchase;

use App\Models\Product\Product;
use App\Models\Purchase\Purchase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface PurchaseServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Purchase;

    public function findScoped(int $id): Purchase;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Purchase;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;

    /**
     * CSV columns (no header row): product_code, qty, unit_code (or 'n/a'), cost, discount_per_unit, tax_name (or 'No Tax').
     *
     * @param  array{warehouse_id: int, supplier_id?: int|null, status?: string, order_tax?: float, paid_amount?: float, paying_method?: string, note?: string|null}  $meta
     */
    public function importCsv(UploadedFile $file, array $meta): Purchase;

    /**
     * Direct-receive stock for a product's initial-stock lines, wrapped in its
     * own Purchase + ProductPurchase + Payment trail (mirrors legacy's
     * autoPurchase-on-product-create behaviour) — one Purchase per warehouse,
     * since a Purchase document is warehouse-scoped.
     *
     * @param  array<int, array{warehouse_id: int, qty: float}>  $lines
     * @return array<int, Purchase>
     */
    public function receiveInitialStock(Product $product, array $lines): array;
}
