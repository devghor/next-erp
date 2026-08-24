<?php

namespace App\Services\Sale;

use App\Models\Sale\CashRegister;

interface CashRegisterServiceInterface
{
    /**
     * The currently-open register for this warehouse under the acting user, if any.
     */
    public function checkAvailability(int $warehouseId): ?CashRegister;

    /**
     * @param  array<string, mixed>  $data
     */
    public function open(array $data): CashRegister;

    /**
     * @param  array<string, mixed>  $data
     */
    public function close(int $id, array $data): CashRegister;

    public function details(int $id): CashRegister;
}
