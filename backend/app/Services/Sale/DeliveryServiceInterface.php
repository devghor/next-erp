<?php

namespace App\Services\Sale;

use App\Models\Sale\Delivery;
use App\Services\BaseServiceInterface;

interface DeliveryServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{sale_id: int, courier_id?: int|null, address?: string|null, delivered_by?: string|null, recieved_by?: string|null, note?: string|null}  $data
     */
    public function create(array $data): Delivery;

    public function findScoped(int $id): Delivery;

    /**
     * @param  array{courier_id?: int|null, address?: string|null, delivered_by?: string|null, recieved_by?: string|null, note?: string|null, status?: string}  $data
     */
    public function update(int $id, array $data): Delivery;

    public function track(int $id): Delivery;
}
