<?php

namespace App\Services\Sale;

use App\Models\Sale\PackingSlip;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PackingSlipServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    public function findScoped(int $id): PackingSlip;

    /**
     * @param  array{sale_id: int, lines: array<int, array{product_sale_id: int, product_id: int, variant_id?: int|null}>}  $data
     */
    public function create(array $data): PackingSlip;

    public function delete(int $id): void;

    /**
     * The sale's product_sales lines not yet packed — feeds the create-form's line picker.
     */
    public function availableLines(int $saleId): Collection;
}
