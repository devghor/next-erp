<?php

namespace App\Services\Sale;

use App\Models\Sale\SaleReturn;
use App\Services\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface SaleReturnServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{sale_id: int, lines: array<int, array{product_sale_id: int, qty: float}>, refund?: bool, refund_amount?: float|null, account_id?: int|null, paying_method?: string|null, return_note?: string|null, staff_note?: string|null, change_sale_status?: bool}  $data
     */
    public function create(array $data): SaleReturn;

    public function findScoped(int $id): SaleReturn;

    /**
     * product_sales lines for a sale where qty - return_qty > 0 (still returnable).
     */
    public function availableLines(int $saleId): Collection;
}
