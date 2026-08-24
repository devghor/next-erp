<?php

namespace App\Services\Product;

use App\Models\Product\DamageStock;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface DamageStockServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): DamageStock;

    public function findScoped(int $id): DamageStock;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): DamageStock;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;
}
