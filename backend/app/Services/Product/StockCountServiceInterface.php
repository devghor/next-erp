<?php

namespace App\Services\Product;

use App\Models\Product\StockCount;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface StockCountServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): StockCount;

    public function findScoped(int $id): StockCount;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): StockCount;

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function submitCount(int $id, array $items): StockCount;

    public function adjust(int $id): StockCount;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;
}
