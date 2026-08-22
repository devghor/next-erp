<?php

namespace App\Services\Product;

use App\Models\Product\Adjustment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdjustmentServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Adjustment;

    public function findScoped(int $id): Adjustment;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Adjustment;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;
}
