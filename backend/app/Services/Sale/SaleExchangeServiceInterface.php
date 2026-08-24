<?php

namespace App\Services\Sale;

use App\Models\Sale\ProductSale;
use App\Models\Sale\Sale;
use App\Models\Sale\SaleExchange;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface SaleExchangeServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    public function findScoped(int $id): SaleExchange;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): SaleExchange;

    /**
     * @return Collection<int, ProductSale>
     */
    public function saleLines(int $saleId): Collection;

    public function findSaleByReference(string $referenceNo): Sale;
}
