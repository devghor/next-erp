<?php

namespace App\Services\Product;

use App\Models\Product\Product;
use App\Services\BaseServiceInterface;

interface ProductServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Product;

    public function findScoped(int $id): Product;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Product;

    /**
     * @return array<string, mixed>
     */
    public function history(int $id): array;

    public function stockFor(Product $product, ?int $warehouseId = null): float;

    public function averageCost(int $productId): float;
}
